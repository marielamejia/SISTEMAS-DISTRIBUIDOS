import requests
url = "http://localhost:90/clasificaapi"
respuesta = requests.post(url, json={"frecuencia":100})
print(respuesta.json())
