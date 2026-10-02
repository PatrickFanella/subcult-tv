preview:
	python -m http.server 18770 --bind 127.0.0.1 --directory .

check-import:
	python scripts/check_import.py

check-automation:
	python scripts/check_automation.py

package:
	python scripts/package_assets.py

check-cutover:
	python scripts/check_cutover.py
