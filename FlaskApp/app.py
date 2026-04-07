import numpy as np
from flask import Flask, request, jsonify, render_template
import pickle

app = Flask(__name__)
modelo = pickle.load(open('modelo.pkl', 'rb'))

@app.route('/clasificaweb', methods=['POST'])
def clasificaweb():
    entrada = [np.array([int(request.form["frecuencia"])])]
    prediccion = modelo.predict(entrada)
    resultado = ""
    if prediccion[0] == 0:
        resultado = "Sano"
    else:
        resultado = "Taquicardia"
    return render_template('index.html', clasificacion=resultado)


@app.route('/clasificaapi', methods=['POST'])
def clasificaapi():
    entrada = request.get_json(force=True)
    prediccion = modelo.predict([np.array([int(entrada["frecuencia"])])])
    resultado = ""
    if prediccion[0] == 0:
        resultado = "Sano-"
    else:
        resultado = "Taquicardia-"
    return jsonify(resultado)



@app.route('/')
def home():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=90)
