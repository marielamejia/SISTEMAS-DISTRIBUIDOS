import grpc
import autenticador_pb2
import autenticador_pb2_grpc
from concurrent import futures

class Authenticator(autenticador_pb2_grpc.AutenticadorServicer):
    def autenticar(self, request, context):
        nombre = request.nombre
        LugarNacimiento = request.LugarNacimiento
        AnioNacimiento = request.AnioNacimiento
        password = request.password
        if(nombre=="Mariela" and LugarNacimiento=="Chiapas" and AnioNacimiento=="2003" and password=="chipilin"):
            return autenticador_pb2.AuthenticationReply(mensaje="Se logró autenticar correctamente", status=True)
        else:
            return autenticador_pb2.AuthenticationReply(mensaje="No se logró autenticar", status=False)
        
def ofrece_servicio():
    puerto="50501"
    servidor=grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    autenticador_pb2_grpc.add_AutenticadorServicer_to_server(Authenticator(), servidor)
    servidor.add_insecure_port("[::]:"+puerto)
    servidor.start()
    print("RPC servidor autenticación exitosamente desplegadas")
    servidor.wait_for_termination()

if __name__=="__main__":
    print("Servicio de autenticación desplegado")
    ofrece_servicio()
