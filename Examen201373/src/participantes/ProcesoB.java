//===========================================================
//================ MARIELA MEJIA GUTIERREZ ==================
//===========================================================
package participantes;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.*;

public class ProcesoB {
    public static void main(String[] args) {
        try {
            int serverPort = 2020; // puerto donde se escucha A

            ServerSocket listenSocket = new ServerSocket(serverPort); // creamos servidor

            while (true) { // aceptar clientes
                System.out.println("Waiting for TCP messages..."); // Mensaje de espera
                Socket clienteSocket = listenSocket.accept(); // bloqueante hasta que llegue un cliente
                Connection c = new Connection(clienteSocket); // crea un hilo para atender a ese cliente
                c.start();              //iniciamos conexion
            }

        } catch (IOException e) {
            System.out.println("ERROR: " + e.getMessage());
        }
    }
}

class Connection extends Thread{
    private Socket socketCliente;
    public Connection(Socket aClientSocket) {
        socketCliente = aClientSocket;
    }

    @Override
    public void run() {
        InputStream in = null; // flujo de entrada
        OutputStream out = null; // flujo de salida TCP
        DatagramSocket udpSocket = null; // para enviar a C y recibir respuesta
        try{
            in =socketCliente.getInputStream();             //obtiene flujo de entrada
            out=socketCliente.getOutputStream();            //para flujo de salida

            byte[] buffer = new byte[1024]; // para leer mensaje de A
            int n = in.read(buffer);        //datos del cliente - bloqueante

            if (n != -1) { // Verifica que sí se recibió algo
                String mensajeRecibido = new String(buffer, 0, n);
                System.out.println("Mensaje recibido de A: " + mensajeRecibido);

                udpSocket = new DatagramSocket(3030); // para enviar a C y recibir respuesta

                byte[] m = mensajeRecibido.getBytes();
                InetAddress host = InetAddress.getByName("127.0.0.1");
                DatagramPacket request = new DatagramPacket(m, m.length, host, 4040); // datagrama dirigido a C

                udpSocket.send(request); // enviamos a c
                System.out.println("Mensaje enviado a C: " + mensajeRecibido); // Confirma envío

                byte[] responseBuffer = new byte[1024]; // para recibir respuesta UDP desde C
                DatagramPacket respuesta = new DatagramPacket(responseBuffer, responseBuffer.length);

                udpSocket.receive(respuesta);

                String mensajeNuevo = new String(respuesta.getData(), 0, respuesta.getLength()); // Convierte la respuesta a String
                System.out.println("Mensaje recibido de C: " + mensajeNuevo);

                out.write(mensajeNuevo.getBytes()); //envia el nuevo mensaje de regreso a A
                System.out.println("Mensaje enviado a A: " + mensajeNuevo);
            }

        }catch(IOException e){
            System.out.println("ERROR: " + e.getMessage());
        }finally{
            try {
                if (udpSocket != null) udpSocket.close(); // Cierra el socket UDP si existe
                if (socketCliente != null) socketCliente.close(); // Cierra el socket TCP con el cliente
            } catch (Exception e) { // Captura errores al cerrar
                System.out.println("close: " + e.getMessage()); // Imprime error al cerrar
            }
        }
    }
}
