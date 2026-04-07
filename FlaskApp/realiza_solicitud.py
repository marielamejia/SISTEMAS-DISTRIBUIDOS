import requests

url = "http://localhost:90/clasificaapi"

respuesta = requests.post(url, json={"frecuencia":200})
print("-------------------",respuesta)
print(respuesta.json())