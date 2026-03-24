import markdown
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

def split_blocks(text):
    blocks = re.split(r'\n\s*\n', text)
    return [b.strip() for b in blocks if b.strip() ]

@app.route('/')
def test():
    return render_template("test1.html")


@app.route('/convert', methods=['POST','GET'])
def index():
    data=request.get_json()
    md_content =data.get("markdown",'')
    blocks=split_blocks(md_content)
    html_blocks = []

    EXTENSIONS = ['fenced_code','codehilite','tables','mdx_math']
    for block in blocks:
        html = markdown.markdown(block,extensions=EXTENSIONS)
        html_blocks.append(html)

    return jsonify(
        {

            "html_blocks":html_blocks
        }
    )

if __name__ == '__main__':
    app.run(debug=True)