Feature: Como colegio quiero tener la posibilidad de filtrar mis alumnos al momento de realizar una asignacion masiva y agilizar la seleccion.

Scenario: Colegio Selecciona todos los alumnos desde checkbox general
Then el contador de alumnos es igual a la suma de todos los niveles

Scenario: Usuario selecciona todos los alumnos de un nivel desde checkbox general de nivel
Then el contador de alumnos es igual a los alumonos del nivel

Scenario: Usuario selecciona todos los alumnos de una seccion desde checkbox general de seccion
Then el contador de alumnos es igual a los alumonos de la seccion

Scenario: Usuario deselecciona una seccion luego de elegir toda un nivel desde el checkbox gral de nivel.
Then contador de alumnos es igual a lo suma de todas las secciones aun seleccionadas
And los checbox pasan a estado unchecked incluido el de la seccion.
And el checkbox del nivel queda en estado chequed pero con el icono half checked.

Scenario: Usuario deselecciona una seccion luego de elegir todos los alumnos de checbox general de alumnos
Then contador de alumnos es igual a lo suma de todas las secciones aun seleccionadas
And los checbox pasan a estado unchecked incluido el de la seccion.
And el checkbox del nivel queda en estado chequed pero con el icono half checked.

Scenario: Al hacer back durante la seleccion y volver a ingresar se pierde la seleccion previa.

Exploratorio:
Revisar check una a uno y contador
Revisar check una a uno de toda una seccion y luego deschequear uno y luego los restantes desde checkbox.
Comportamiento Check y uncheck de nodos