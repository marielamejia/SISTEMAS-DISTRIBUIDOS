import numpy as np
from flask import Flask, request, render_template
import pickle

app = Flask(__name__)
modelo = pickle.load(open('modelo.pkl', 'rb'))
mensajes=[] #base de datos temporal

#Regresa el template index.html
@app.route("/")
def index():        
    return render_template('index.html')

@app.route("/nuevo_mensaje", methods=["POST"])
def nuevo_mensaje(): #agregamos el mensaje mandado a la lista de mensajes
    nombre = request.form.get("nombre")
    mensaje = request.form.get("mensaje")         

    mensajes.append({               #concatenamos a nuestra lista de mensajes
            "nombre": nombre,
            "mensaje": mensaje
    })
    return redirect(url_for("ver_mensajes"))        #queremos regresar todos los mensajes que hay

#Regresa el template mensajes.html pasando como contexto una lista mensajes de objetos JSON
@app.route("/mensajes", methods=["GET"])    
def ver_mensajes():
    return render_template('mensajes.html', mensajes=mensajes)     #regresamos los mensajes que hay

if __name__ == "__main__":      #si no ponemos esto no funciona 
    app.run(host="0.0.0.0", port=90)