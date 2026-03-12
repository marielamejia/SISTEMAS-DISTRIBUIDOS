import grpc
import comunicacion_pb2
import comunicacion_pb2_grpc

def generador_elementos(elementos):
    for elemento in elementos:
        yield comunicacion_pb2.Elemento(descripcion=elemento)

def arranca():
    puerto="50501"
    with grpc.insecure_channel("localhost:"+puerto) as channel:
        stub=comunicacion_pb2_grpc.ComunicadorStub(channel)
        iterador = generador_elementos(["Elemento A", 
                                        "Elemento B", 
                                        "Elemento C"])
        respuesta= stub.agregador(iterador)
        for elemento in stub.listador1(comunicacion_pb2.Empty()):
            print(elemento.id, elemento.descripcion)
        listado= stub.listador2(comunicacion_pb2.Empty())
        for elemento in listado.objetos:
            print(elemento.id,elemento.descripcion)

if __name__=="__main__":
    print("Arranco el cliente")
    arranca()