from flask import Flask, request, app, render_template
import os
from flask_cors import CORS
import cv2
import base64
import dlib
import numpy as np
import pandas as pd
from pandas import DataFrame
import math
import configparser

config = configparser.ConfigParser()
with open('face.conf', 'r') as cfgfile:
    config.read_file(cfgfile)
    FACE_SEC = config._sections['face']
    ID_LEN=int(FACE_SEC['len'])
    DISTANCE=float(FACE_SEC['distance'])
crop_dim=160

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
default_graph=None

def _load_model(model_filepath):
    """
    Load frozen protobuf graph
    :param model_filepath: Path to protobuf graph
    :type model_filepath: str
    """
    model_exp = os.path.expanduser(model_filepath)
    if os.path.isfile(model_exp):
        print('Model filename: %s' % model_exp)
        with gfile.FastGFile(model_exp, 'rb') as f:
            graph_def = tf.GraphDef()
            graph_def.ParseFromString(f.read())

            tf.import_graph_def(graph_def, name='')

    else:
        print('Missing model file. Exiting')


def verify_on_embedding(emb_array, verified_emb_array):
    emb = emb_array[0]
    distance = 0
    for i in range(0, verified_emb_array.shape[0]):
        verified_emb = verified_emb_array[i]
        distance += get_distance(emb, verified_emb)
    distance /= verified_emb_array.shape[0]
    return distance

def get_distance(emb, verified_emb):
    distance = 0
    for i in range(0, len(emb)):

        distance += math.pow(emb[i] - verified_emb[i], 2)
    return math.sqrt(distance)

detector = dlib.get_frontal_face_detector()
shape_predictor = dlib.shape_predictor('landmarks.dat')
face_rec_model = dlib.face_recognition_model_v1("recognition.dat")



@app.route('/scan/')
def scan():
    return render_template('scan.html')

@app.route('/face', methods=['POST'])
def face():
    pic = request.get_data()
    base64pic = pic[23:]
    imgdata = base64.b64decode(base64pic)
    nparr=np.fromstring(imgdata,np.uint8)
    img=cv2.imdecode(nparr,cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    print(img.shape)
    dets = detector(img, 1)
    if (len(dets) < 1):
        return "no face detected"
    for index_, face in enumerate(dets):
        shape = shape_predictor(img, face)
        face_descriptor = face_rec_model.compute_face_descriptor(img, shape)
        verified_emb = np.reshape(face_descriptor, (1, 128))
    global index
    global min
    min = np.float32("inf")
    dirs = os.listdir("facelib")
    for id in dirs:
        df = pd.read_csv("facelib/" + id + "/data.csv", header=None)
        emblib = np.array(df, dtype=np.float32)
        sum=verify_on_embedding(emblib,verified_emb)
        print(str(sum)+" : "+id)
        if sum<min:
            min=sum
            index = id
    if min <= DISTANCE:
        return str('id: '+index)
    else:
        return 'mismatch'

@app.route('/reg/')
def reg():
    return render_template('reg.html')


@app.route('/register', methods=['POST'])
def register():
    pic = request.get_data()
    base64pic = pic[23+ID_LEN:]
    id=pic[:ID_LEN]
    id=str(id,encoding = "utf-8")
    imgdata = base64.b64decode(base64pic)
    nparr=np.fromstring(imgdata,np.uint8)
    img=cv2.imdecode(nparr,cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    dets = detector(img, 1)
    if(len(dets)<1):
        return "no face detected"
    for index_, face in enumerate(dets):
        shape = shape_predictor(img, face)
        face_descriptor = face_rec_model.compute_face_descriptor(img, shape)
        verified_emb=np.reshape(face_descriptor,(1,128))
        targetpath = "facelib/"+id
        if not os.path.isdir(targetpath):
            os.makedirs(targetpath)
        if not os.path.exists("facelib/"+id+"/data.csv"):
            os.mknod("facelib/"+id+"/data.csv")
            emblib=None
        else:
            df = pd.read_csv("facelib/" + id + "/data.csv", header=None)
            emblib = np.array(df, dtype=np.float32)
        emblib = np.concatenate([emblib, verified_emb]) if emblib is not None else verified_emb
        df = DataFrame(emblib)
        df.to_csv("facelib/"+id+"/data.csv", index=False, header=False)
    return "registered"


if __name__ == '__main__':
    app.run(host="0.0.0.0",ssl_context=(
        "cert.pem",
        "key.pem"))
