"""Pack the Vite build (dist/) into one self-contained HTML page for publishing as a Claude artifact."""
import pathlib, re, sys

dist = pathlib.Path("dist")
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "dist/quiet-tracker.html")
html = (dist / "index.html").read_text()
css = "".join((dist / m).read_text() for m in re.findall(r'href="\./(assets/[^"]+\.css)"', html))
js = "".join((dist / m).read_text() for m in re.findall(r'src="\./(assets/[^"]+\.js)"', html))
js = js.replace("</script", "<\\/script")
out.write_text(
    "<title>Quiet Tracker</title>\n"
    '<meta name="claude:viewport-fit-sides" content="cover">\n'
    '<meta name="theme-color" content="#fbfaf8">\n'
    f"<style>{css}</style>\n"
    '<div id="root"></div>\n'
    f'<script type="module">{js}</script>\n'
)
print(out, out.stat().st_size, "bytes")
