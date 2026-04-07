import pickle
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

# Números decimales
np.set_printoptions(suppress=True)

# Frecuencias cardíacas de 20 personas 
frecuencias_cardiacas =  np.array([[65], [70], [80], [80], [80], [90],
                                   [95], [100], [105], [110], [105],
                                   [110], [110], [120], [120], [130],
                                   [140], [180], [185], [190]])

# Clase de las personas 0: Normal    1: Taquicardía 
clase = np.array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])


# Creamos conjuntos de entrenamiento y de prueba del modelo
datos_entrena, datos_prueba, clase_entrena, clase_prueba = \
    train_test_split(frecuencias_cardiacas, clase, test_size=0.30)

# Creamos el modelo 
modelo = LogisticRegression().fit(datos_entrena, clase_entrena)
pickle.dump(modelo, open('modelo.pkl', 'wb'))
modelo = pickle.load(open('modelo.pkl','rb'))

print(modelo.predict(datos_prueba))
print(modelo.predict_proba(datos_prueba))
print(modelo.score(datos_prueba, clase_prueba))
print(modelo.intercept_, modelo.coef_)
