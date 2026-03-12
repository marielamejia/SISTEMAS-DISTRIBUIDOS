import grpc
import autenticador_pb2
import autenticador_pb2_grpc

def arranca():
    puerto="50501"
    with grpc.insecure_channel("localhost:"+puerto) as channel:
        stub=autenticador_pb2_grpc.AutenticadorStub(channel)
        respuesta=stub.autenticar(autenticador_pb2.AuthenticationRequest(nombre="Mariela", LugarNacimiento="Chiapas", AnioNacimiento="2003", password="chipilin"))
        print(respuesta.mensaje)

if __name__=="__main__":
    print("Cliente autenticador iniciado :)")
    arranca()