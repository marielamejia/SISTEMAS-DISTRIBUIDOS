from concurrent import futures
import grpc
import comunicacion_pb2
import comunicacion_pb2_grpc

class Comunicador(comunicacion_pb2_grpc.ComunicadorServicer):
    elementos={}
    folio=0

    #ESTE VA GENERANDO UNO A UNO
    def listador1(self, request, context):
        for elemento in Comunicador.elementos.values():
            yield elemento          #usamos yield en lugar de return porque es un generador
    
    #ESTE REGRESA TODO EL OBJETO
    def listador2(self, request, context):
        listado = []
        for elemento in Comunicador.elementos.values():
            listado.append(elemento)
        return comunicacion_pb2.ListadoElementos(objetos=listado)
    
    def agregador(self, request_iterator, context):
        for elemento in request_iterator:
            Comunicador.folio+=1
            Comunicador.elementos[Comunicador.folio] = comunicacion_pb2.Elemento(id=Comunicador.folio, descripcion=elemento.descripcion)
        return comunicacion_pb2.Status(status=True)

def ofrece_servicio():
    puerto="50501"
    servidor=grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    comunicacion_pb2_grpc.add_ComunicadorServicer_to_server(Comunicador(), servidor)
    servidor.add_insecure_port("[::]:"+puerto)
    servidor.start()    
    print("RPC exitosamente desplegadas")
    servidor.wait_for_termination()

if __name__=="__main__":
    print("Servicio de comunicacion desplegado")
    ofrece_servicio()