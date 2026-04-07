//===========================================================
//================ MARIELA MEJIA GUTIERREZ ==================
//===========================================================
package participantes;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;

public class ProcesoA {
    private static final String HOST = "127.0.0.1";     //tambien podemos usar localhost
    private static final int PUERTO_TCP_B = 2020;

    public static void enviarTCP(){
        Socket socket = null;       //creamos socket pero aun no tenemos la conexion (por eso es null)
        try{
            socket = new Socket(HOST, PUERTO_TCP_B);

            OutputStream out = socket.getOutputStream();         //para flujo de salida de A a B
            InputStream in = socket.getInputStream();           //para tener flujo de entrada de B

            String mensaje = "m";
            out.write(mensaje.getBytes());              //convertimos el mensaje de string a bytes

            System.out.println("El mensaje enviado es: " + mensaje);

            byte[] buffer = new byte[1024];         //creamos buffer para recibir respuesta de B
            int n = in.read(buffer);            //leemos del socket - bloqueante (espera a recibir algo)

            if (n != -1) {          //debemos checar que si se recibió algo
                String response = new String(buffer, 0, n);     //convertimos de bytes a string (esta es la respuesta de B a A)
                System.out.println("respuesta recibida: " + response);      //de B a A
            }
        }catch (IOException e){
            System.out.println("TCP error: " + e.getMessage());
        }finally{
            if (socket != null) {       //si si tenemos un socket abierto, lo cerramos
                try {
                    socket.close();
                } catch (IOException e) {       //error si no se logra cerrar el socket
                    System.out.println("close: " + e.getMessage());
                }
            }
        }
    }

    public static void main(String[] args) {
        enviarTCP();
    }
}
