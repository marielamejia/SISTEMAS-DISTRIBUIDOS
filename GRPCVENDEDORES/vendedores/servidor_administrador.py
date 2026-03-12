from concurrent import futures
import grpc
import administracion_pb2
import administracion_pb2_grpc
import random 

class Servidor(administracion_pb2_grpc.ServidorServicer):
    #CONTADORES PARA CREAR IDs
    folio_vendedores = 0
    folio_productos = 0
    folio_tiendas = 0
    folio_asignaciones = 0

    #DICCIONARIOS PARA ALMACENAR
    vendedores = {}
    tiendas = {}
    productos = {}
    asignaciones = {}

    def RegistroVendedor(self, request, context):
        self.folio_vendedores+=1; #aumentamos id
        vendedor = administracion_pb2.Vendedor(self.folio_vendedores, request.nombre, request.edad, request.salario) #creamos vendedor
        Servidor.vendedores[Servidor.folio_vendedores] = vendedor #agregamos vendedor a vendedores
        return administracion_pb2.Status(status=True)

    def RegistroTienda (self, request, context):
        self.folio_tiendas+=1; 
        tienda = administracion_pb2.Tienda(self.folio_tiendas, request.descripcion, request.alcaldia) #creamos tienda
        Servidor.tiendas[Servidor.folio_tiendas] = tienda #agregamos tienda a tiendas
        return administracion_pb2.Status(status=True)
    
    def RegistroAsignacion (self, request, context): 
        self.folio_asignaciones+=1
        idTienda =  random.choice(list(Servidor.tiendas.keys()))
        idVendedor = random.choice(list(Servidor.vendedores.keys()))
        asignacion = administracion_pb2.Asignacion(self.folio_asignaciones, idTienda, idVendedor)
        Servidor.asignaciones[Servidor.folio_asignaciones] = asignacion
        return administracion_pb2.Status(status=True)

    def listadoTienda (self, request, context): 
        for tienda in Servidor.tiendas.values():
            yield tienda

    def listadoVendedor (self, request, context): 
        for vendedor in Servidor.vendedores.values():
            yield vendedor 

    def listadoAsignaciones (self, request, context): 
        listado=[]
        for asignacion in Servidor.asignaciones.values():
            listado.append(asignacion)
        return administracion_pb2.ListadoAsignaciones(objetos=listado)

    def agregaProducto (self, request_iterator, context): 
        for producto in request_iterator:
            self.folio_productos+=1
            Servidor.productos[Servidor.folio_productos] = administracion_pb2.Producto(id=Servidor.folio_productos, cantidad=producto.cantidad, descripcion=producto.descripcion)
        return administracion_pb2.Status(status=True)

    def ListadoProductos (self, request, context): 
        for producto in Servidor.productos.values():
            yield producto 
    
def ofrece_servicio():
    puerto="50501"
    servidor=grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    administracion_pb2_grpc.add_ServidorServicer_to_server(Servidor(), servidor)
    servidor.add_insecure_port("[::]:"+puerto)
    servidor.start()    
    print("RPC exitosamente desplegadas")
    servidor.wait_for_termination()

if __name__=="__main__":
    print("Servicio de comunicacion desplegado")
    ofrece_servicio()