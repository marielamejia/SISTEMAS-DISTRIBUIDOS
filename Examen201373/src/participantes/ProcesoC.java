//===========================================================
//================ MARIELA MEJIA GUTIERREZ ==================
//===========================================================
package participantes;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

public class ProcesoC {
    public static void main(String args[]) {
        DatagramSocket socket = null;
        try{
            socket = new DatagramSocket(4040);          //creamos socket en puerto 2022
            while(true){        //queremos que siga atendiendo los mensajes
                byte[] buffer = new byte[1024];
                DatagramPacket mensaje = new DatagramPacket(buffer, buffer.length);
                socket.receive(mensaje);        //bloqueado hasta que recibe mensaje

                String mensajeRecibido = new String(mensaje.getData(), 0, mensaje.getLength()); // bytes a String
                System.out.println("Se recibió de B: " + mensajeRecibido);

                String mensajeModificado = mensajeRecibido+"*"; //editamos el mensaje para agregar asterisco
                System.out.println("mensaje modificado: " + mensajeModificado);

                byte[] m = mensajeModificado.getBytes();
                InetAddress host = InetAddress.getByName("127.0.0.1");      //para saber a donde mandar

                DatagramPacket respuesta = new DatagramPacket(m, m.length, host, 3030);
                socket.send(respuesta); // envia la respuesta a B
                System.out.println("mensaje enviado a B: " + mensajeModificado);
            }
        } catch (IOException e) {
            System.out.println("ERROR: " + e.getMessage());
        } finally {
            if (socket != null) {       //si si se creo el socket, entonces lo cerramos
                socket.close();
            }
        }
    }
}
