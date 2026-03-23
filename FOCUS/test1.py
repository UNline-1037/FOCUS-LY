from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import markdown

app = Flask(__name__)
CORS(app)

@app.route('/')
def test():
    return render_template("test1.html")


@app.route('/post', methods=['POST','GET'])
def index():
    data=request.get_json()
    md_content =data['md_text']
    html_content = markdown.markdown(
        md_content,
        extensions=[
            'extra',
            'codehilite',
            'toc'
        ],
        output_format='html5'
    )
    return jsonify(
        {
            "status":"success",
            "html":html_content
        }
    )

if __name__ == '__main__':
    app.run(debug=True)