from pathlib import Path
import shutil,subprocess,sys,tempfile
root=Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix='subcult-studio-tests-') as folder:
 dest=Path(folder)/'social-posting'
 shutil.copytree(root/'automation/social-posting',dest,ignore=shutil.ignore_patterns('__pycache__'))
 # The repository config is copied with the source; tests use disposable state.
 subprocess.run([sys.executable,'-m','unittest','discover','-p','test_*.py'],cwd=dest,check=True)
