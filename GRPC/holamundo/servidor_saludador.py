import grpc
import holamundo_pb2
import holamundo_pb2_grpc
from concurrent import futures

class Saludador(holamundo_pb2_grpc.SaludadorServicer):
    def diHola(self, request, context):
        saludo="Helloooo " + request.name
        return holamundo_pb2.HolaResponse(message=saludo)
    
def ofrece_servicio():
    puerto="50501"
    servidor = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    holamundo_pb2_grpc.add_SaludadorServicer_to_server(Saludador(),servidor)
    #se añade puerto en todas las interfaces disponibles
    servidor.add_insecure_port("[::]:"+puerto)
    servidor.start()
    print("RPC exitosamente desplegadas")
    servidor.wait_for_termination()         #se detiene cuando detenemos el proceso

if __name__=="__main__":
    print("Servicio de saludos desplegado")
    ofrece_servicio()