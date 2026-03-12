import grpc
import administracion_pb2
import administracion_pb2_grpc

def generador_asignaciones(asignaciones):
    for asignacion in asignaciones:
        yield administracion_pb2.Asignacion(idasignacion=asignacion[0], idtienda=asignacion[1], idvendedor=asignacion[2])

def arranca():
    puerto="50501"
    with grpc.insecure_channel("localhost:"+puerto) as channel:
        stub = administracion_pb2_grpc.ServidorStub(channel)
        


if __name__=="__main__":
    print("Arranco el cliente")
    arranca()