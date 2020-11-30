from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import shutil

# different delimiters in jinja2 + flask
class CustomFlask(Flask):
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update(dict(
        block_start_string='<%',
        block_end_string='%>',
        variable_start_string='%%',
        variable_end_string='%%',
        comment_start_string='<#',
        comment_end_string='#>',
    ))

#app = Flask(__name__)
app = CustomFlask(__name__)
app.config['DEBUG'] = True

CORS(app, resources={r'/*': {'origins': '*'}})

ROOT_DIR = 'files_dir'

def process_read_folder(path):
    result = {}
    result['status'] = 'ok'
    result['path'] = path
    result['folders'] = []
    result['files'] = []
    path = ROOT_DIR + '/' + path[1:]
    for (dirpath, dirs, files) in os.walk(path):
        result['files'].extend(files)
        result['folders'].extend(dirs)
        break
    result['files'].sort()
    result['folders'].sort()
    return result

def process_create_folder(path):
    path = ROOT_DIR + '/' + path[1:]
    result = {}
    try:  
        os.mkdir(path)
        result['status'] = 'ok'
    except OSError as error:  
        result['status'] = 'error'
    return result

def process_remove_files(files):
    print('remove files: ', files)
    result = {}
    result['status'] = 'ok'
    for f in files:
        try:
            path = ROOT_DIR + '/' + f[1:]
            if(os.path.isfile(path)):
                os.remove(path)
            if(os.path.isdir(path)):
                shutil.rmtree(path)
        except Exception as err:
            print(err)
            result['status'] = 'error'
            break
    return result


@app.route("/")
def index():
    return render_template("index.html")

@app.route('/css/<path:filename>')
def get_css(filename):
    dir_css = 'templates/css'
    try:
        return send_from_directory(dir_css, filename, as_attachment=False)
    except FileNotFoundError:
        abort(404)

@app.route('/js/<path:filename>')
def get_js(filename):
    dir_js = 'templates/js'
    try:
        return send_from_directory(dir_js, filename, as_attachment=False)
    except FileNotFoundError:
        abort(404)


@app.route('/files', methods=['GET', 'POST'])
def files():
    if request.method == 'POST':
        req = request.get_json()
        action = req['action']
        if(action == 'read_folder'):
            return jsonify(process_read_folder(req['path']))
        elif(action == 'create_folder'):
            return jsonify(process_create_folder(req['path']))
        elif(action == 'remove_files'):
            return jsonify(process_remove_files(req['files']))
        else:
            status = 'error'
            response = { 'action': action, 'status': status }
            print(req)
            return jsonify(response)
    else:
        file_path = request.args.get('file')
        if(not file_path):
            return render_template("index.html")
        else:
            if file_path[0] == '/':
                file_path = file_path[1:]
            full_path = os.path.join(ROOT_DIR, file_path)
            (file_dir, file_path) = os.path.split(full_path)
            try:
                return send_from_directory(file_dir, file_path, as_attachment=False)
            except FileNotFoundError:
                abort(404)

    
