import { Link, type LinkProps } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'signal';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    as?: 'button';
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<LinkProps, keyof ButtonBaseProps> & {
    as: 'link';
    to: string;
  };

type ButtonAsAnchor = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    as: 'a';
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-signal text-void hover:bg-glow border-2 border-signal hover:border-glow shadow-hard',
  secondary: 'bg-transparent text-chalk border-2 border-chalk hover:bg-chalk hover:text-void',
  ghost: 'bg-transparent text-bone hover:text-glow border-2 border-transparent hover:border-fog',
  signal: 'bg-transparent text-signal border-2 border-signal hover:bg-signal hover:text-void',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

export default function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className = '', children, ...rest } = props;

  const baseStyles = `
    inline-flex items-center justify-center
    font-mono font-bold uppercase tracking-wider
    transition-all duration-200
    focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-2
    cursor-pointer select-none
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `.trim();

  if (props.as === 'link') {
    const {
      as: asProp,
      to,
      ...linkRest
    } = rest as Omit<LinkProps, keyof ButtonBaseProps> & {
      as: 'link';
      to: string;
    };
    void asProp;
    return (
      <Link to={to} className={baseStyles} {...linkRest}>
        {children}
      </Link>
    );
  }

  if (props.as === 'a') {
    const {
      as: asProp,
      href,
      ...anchorRest
    } = rest as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
      as: 'a';
      href: string;
    };
    void asProp;
    return (
      <a href={href} className={baseStyles} {...anchorRest}>
        {children}
      </a>
    );
  }

  const { as: asProp, ...buttonRest } = rest as Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    keyof ButtonBaseProps
  > & { as?: 'button' };
  void asProp;
  return (
    <button className={baseStyles} {...buttonRest}>
      {children}
    </button>
  );
}
