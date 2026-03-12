import grpc
import holamundo_pb2
import holamundo_pb2_grpc

def arranca():
    #debemos crear un canal de comunicación con el servidor (inseguro)
    puerto = "50501"
    with grpc.insecure_channel("localhost:"+puerto) as channel:
        stub=holamundo_pb2_grpc.SaludadorStub(channel)
        respuesta = stub.diHola(holamundo_pb2.HolaRequest(name="Mariela"))
        print(respuesta.message)

if __name__=="__main__":
    print("Arrancó el cliente")
    arranca()