from flask import Flask, render_template, request, make_response, jsonify, send_from_directory, abort
from flask_cors import CORS
from werkzeug import secure_filename
import os
import shutil
import jwt 
from datetime import datetime, timedelta
from functools import wraps

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

# configuration 
# NEVER HARDCODE YOUR CONFIGURATION IN YOUR CODE 
# INSTEAD CREATE A .env FILE AND STORE IN IT 
app.config['SECRET_KEY'] = 'your secret key'

my_users = [
    { 'login': 'user1', 'password': 'pas1' },
    { 'login': 'user2', 'password': 'pas2' },
    { 'login': 'user3', 'password': 'pas3' },
]

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

def process_copy_files(files, dst_path):
    print('copy files: ' + str(files) + ' to dst: ' + str(dst_path))
    result = {}
    result['status'] = 'ok'
    for f in files:
        try:
            src = os.path.join(ROOT_DIR, f[1:])
            (_, name) = os.path.split(src)
            dst = os.path.join(ROOT_DIR, dst_path[1:], name)
            #print('src: ', src)
            #print('dst: ', dst)
            if(os.path.isfile(src)):
                shutil.copy(src, dst)
            if(os.path.isdir(src)):
                shutil.copytree(src, dst)
        except Exception as err:
            print(err)
            result['status'] = 'error'
            break
    return result

def process_move_files(files, dst_path):
    print('move files: ' + str(files) + ' to dst: ' + str(dst_path))
    result = {}
    result['status'] = 'ok'
    for f in files:
        try:
            src = os.path.join(ROOT_DIR, f[1:])
            (_, name) = os.path.split(src)
            dst = os.path.join(ROOT_DIR, dst_path[1:], name)
            print('src: ', src)
            print('dst: ', dst)
            shutil.move(src, dst)
        except Exception as err:
            print(err)
            result['status'] = 'error'
            break
    return result

def process_rename_file(src_file, dst_file):
    print('rename file from: ' + str(src_file) + ' to: ' + str(dst_file))
    result = {}
    result['status'] = 'ok'
    try:
        src = os.path.join(ROOT_DIR, src_file[1:])
        dst = os.path.join(ROOT_DIR, dst_file[1:])
        shutil.move(src, dst)
    except Exception as err:
        print(err)
        result['status'] = 'error'
    return result

def process_upload_file(file_storage, path):
    print('name1: ', file_storage.filename)
    name = secure_filename(file_storage.filename)
    print('name2: ', name)
    file_name = os.path.join(ROOT_DIR, path[1:], name)
    print('process_upload_file name: ' + file_name)
    result = {}
    result['status'] = 'ok'
    file_storage.save(file_name)
    return result

def is_user_valid(user_name):
    for u in my_users:
        if u['login'] == user_name:
            return True
    return False

def get_user_by_name_password(name, password):
    for u in my_users:
        if u['login'] == name and u['password'] == password:
            return u
    return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if request.method == 'GET':
            token = request.args.get('token')
        else:
            token_header = 'Authorization'
            print('token_required headers:', request.headers)
            # jwt is passed in the request header
            if token_header in request.headers:
                token = request.headers[token_header]
        if not token:
            print('return 401 if token is not passed')
            return jsonify({'message' : 'Token is missing !!'}), 401
        try:
            # decoding the payload to fetch the stored details
            data = jwt.decode(token, app.config['SECRET_KEY'])
            current_user = data['login']
            if not is_user_valid(current_user):
                print('current_user: ', current_user, ' not valid')
                return jsonify({ 'message' : 'Token is invalid !!'}), 401
        except Exception as err:
            print(err)
            return jsonify({ 'message' : 'Token is invalid !!'}), 401
        # returns the current logged in users contex to the routes
        return f(current_user, *args, **kwargs)
    return decorated

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

@app.route("/login", methods =['POST'])
def login():
    auth = request.get_json()
    print(auth)
    
    if not auth or not auth.get('name') or not auth.get('password'):
        # returns 401 if any email or / and password is missing
        return make_response(
            'Could not verify',
            401,
            {'WWW-Authenticate' : 'Basic realm ="Login required !"'}
        )

    log = auth.get('name')
    pas = auth.get('password')
    user = get_user_by_name_password(log, pas)
    if user:
        # generates the JWT Token
        token = jwt.encode(
            {
                'login': user['login'],
                'exp' : datetime.utcnow() + timedelta(minutes = 30)
            },
            app.config['SECRET_KEY']
        )
        return make_response(
            jsonify({'token': token.decode('UTF-8'), 'user': log}),
            201
        )

    # returns 403 if password is wrong 
    return make_response(
        'Could not verify',
        403,
        {'WWW-Authenticate' : 'Basic realm ="Wrong login / password!"'}
    )



@app.route('/files', methods=['GET', 'POST'])
@token_required
def files(current_user):
    print('files current_user: ', current_user)
    if request.method == 'POST':
        if ('application/json' in request.content_type):
            req = request.get_json()
            action = req['action']
            if(action == 'read_folder'):
                return jsonify(process_read_folder(req['path']))
            elif(action == 'create_folder'):
                return jsonify(process_create_folder(req['path']))
            elif(action == 'remove_files'):
                return jsonify(process_remove_files(req['files']))
            elif(action == 'copy_files'):
                return jsonify(process_copy_files(req['files'], req['dst_path']))
            elif(action == 'move_files'):
                return jsonify(process_move_files(req['files'], req['dst_path']))
            elif(action == 'rename_file'):
                return jsonify(process_rename_file(req['src_file'], req['dst_file']))
            else:
                status = 'error'
                response = { 'action': action, 'status': status }
                print(req)
                return jsonify(response)
        elif ('multipart/form-data' in request.content_type):
            file_storage = request.files['file']
            file_path = request.form['path']
            return jsonify(process_upload_file(file_storage, file_path))
        else:
            print('content_type: ', request.content_type)
            abort(404)
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

    
