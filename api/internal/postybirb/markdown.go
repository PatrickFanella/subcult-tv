package postybirb

import (
	"fmt"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/text"
	"strings"
)

type node map[string]any

// Document translates the supported Markdown into the editor format used by
// PostyBirb. Unsupported media/HTML fails before a submission is created.
func Document(body string) (node, error) {
	source := []byte(body)
	root := goldmark.DefaultParser().Parse(text.NewReader(source))
	var convert func(ast.Node, []node) ([]node, error)
	convert = func(n ast.Node, marks []node) ([]node, error) {
		var typ string
		attrs := map[string]any{}
		switch v := n.(type) {
		case *ast.Document:
			typ = "doc"
		case *ast.Paragraph, *ast.TextBlock:
			typ = "paragraph"
		case *ast.Heading:
			typ = "heading"
			attrs["level"] = v.Level
		case *ast.List:
			typ = "bulletList"
			if v.IsOrdered() {
				typ = "orderedList"
				attrs["start"] = v.Start
			}
		case *ast.ListItem:
			typ = "listItem"
		case *ast.Blockquote:
			typ = "blockquote"
		case *ast.ThematicBreak:
			return []node{{"type": "horizontalRule"}}, nil
		case *ast.Text:
			value := string(v.Segment.Value(source))
			out := []node{}
			if value != "" {
				t := node{"type": "text", "text": value}
				if len(marks) > 0 {
					t["marks"] = marks
				}
				out = append(out, t)
			}
			if v.HardLineBreak() {
				out = append(out, node{"type": "hardBreak"})
			} else if v.SoftLineBreak() {
				out = append(out, node{"type": "text", "text": " "})
			}
			return out, nil
		case *ast.String:
			t := node{"type": "text", "text": string(v.Value)}
			if len(marks) > 0 {
				t["marks"] = marks
			}
			return []node{t}, nil
		case *ast.Emphasis:
			mark := "italic"
			if v.Level == 2 {
				mark = "bold"
			}
			marks = append(append([]node{}, marks...), node{"type": mark})
		case *ast.Link:
			href := string(v.Destination)
			if !strings.HasPrefix(href, "https://") {
				return nil, fmt.Errorf("only HTTPS links are supported")
			}
			marks = append(append([]node{}, marks...), node{"type": "link", "attrs": map[string]any{"href": href}})
		case *ast.CodeSpan:
			marks = append(append([]node{}, marks...), node{"type": "code"})
		default:
			return nil, fmt.Errorf("unsupported Patreon formatting: %s", n.Kind().String())
		}
		content := []node{}
		for child := n.FirstChild(); child != nil; child = child.NextSibling() {
			converted, err := convert(child, marks)
			if err != nil {
				return nil, err
			}
			content = append(content, converted...)
		}
		if typ == "" {
			return content, nil
		}
		item := node{"type": typ, "content": content}
		if len(attrs) > 0 {
			item["attrs"] = attrs
		}
		return []node{item}, nil
	}
	result, err := convert(root, nil)
	if err != nil {
		return nil, err
	}
	return result[0], nil
}
