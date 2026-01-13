Feature: Como escuela queremos contar con un registro histórico que nos permita entender los cambios en el stock ante cada acción de edición de una variante

Scenario Outline: Usuario edita el flag ilimitado del stock a un concepto opcional sin variantes y se registra el evento historico
Given existe un concepto opcional sin variantes
And la orden tiene stock con flag <flag-actual>
And existe un usuario con permisos de edicion de stock
When usuario ingresa en el detalle del concepto
And edita el del stock el flag <flag-editado>
And ingresa en tab Historial de cambios
Then se visualiza una card arriba de la lista de cards con el cambio
And en la card se ve el nombre de usuario + <acción>
And no tiene opcion de expandir la card

Examples:
| flag-actual | flag editado      | accion       |
|   true      |  false            | quito        |
|   false     |  true             | agrego       |

Scenario Outline: Usuario edita cantidad del stock a un concepto opcional con variantes y se registra el evento historico
Given existe un concepto opcional con variantes
And la orden tiene stock con flag <flag-actual>
And existe un usuario con permisos de edicion de stock
When usuario ingresa en el detalle del concepto
And edita del stock el flag <flag-editado> a una variante
And ingresa en tab Historial de cambios
Then se visualiza una card arriba de la lista de cards con el cambio
And en la card se ve el nombre de usuario + <acción>
And no se visualizan cambios historicos de otra variante
And no tiene opcion de expandir la card

Examples:
| flag-actual | flag editado      | accion       |
|   true      |  false            | quito        |
|   false     |  true             | agrego       |

Scenario: Usuario agrega stock a un concepto opcional y se registra el evento historico
Given existe un concepto opcional con variantes
And la orden tiene configurado stock limitado = 0 unidades
And existe un usuario con permisos de edicion de stock
When usuario ingresa en el detalle del concepto
And ingresa en el sidepanel de la variante
And aumenta stock en 5 unidades
And completa comentario "Prueba Aumentar Stock"
And ingresa en tab Historial de cambios
Then se visualiza una card arriba de la lista de cards con el cambio
And en la card se ve el nombre de usuario + agrego 5 unidades de stock
And el usuario expande la card
And visualiza cambio de stock de 0 a 5 unidades disponibles
And visualiza el comentario "Prueba Aumentar Stock"

Scenario: Usuario agrega stock a un concepto opcional y se registra el evento historico card expanded
Given existe un concepto opcional con variantes
And la orden tiene configurado stock limitado = 5 unidades
And existe un usuario con permisos de edicion de stock
When usuario ingresa en el detalle del concepto
And ingresa en el sidepanel de la variante
And reduce stock en 5 unidades
And completa comentario "Prueba Reduccion Stock"
And ingresa en tab Historial de cambios
Then se visualiza una card arriba de la lista de cards con el cambio
And en la card se ve el nombre de usuario + redujo 5 unidades de stock
And el usuario expande la card
And visualiza cambio de stock de 5 a 0 unidades disponibles
And visualiza el comentario "Prueba Reduccion Stock"

Scenario: Usuario agrega stock a un concepto opcional y se registra el evento historico card expanded
Given existe un concepto opcional con variantes
And la orden tiene configurado stock limitado > 5
And existe un usuario con permisos de edicion de stock
When usuario ingresa en el detalle del concepto
And ingresa en el sidepanel de la variante
And reduce stock en 5 unidades
And ingresa en tab Historial de cambios
Then se visualiza una card arriba de la lista de cards con el cambio
And en la card se ve el nombre de usuario + redujo 5 unidades de stock

Scenario: Usuario ingresa en historial de cambios y se ordena las cards en forma descendente por dia mes año.
Given existe un concepto con variantes
And la variante tiene movimientos para el mis dia hora y minuto con diferencia de segundos
When el usuario ingresa al sidepanel de la variante
And ingresa en la tab historial de cambios
Then se ordenan las cards en forma descendente por dia mes año
And se ordenan las cards del dia en forma descendente por hora minuto y segundo


Scenario: Usuario ingresa en historial de cambios y se ordena las cards en forma descendente por dia mes año.
Given existe un concepto con variantes
And la variante tiene movimientos para el mis dia hora y minuto con diferencia de segundos
When el usuario ingresa al sidepanel de la variante
And ingresa en la tab historial de cambios
Then se ordenan las cards en forma descendente por dia mes año
And se ordenan las cards del dia en forma descendente por hora minuto y segundo

Scenario: Usuario hace scroll en historial con mas de 10 registros
Given existe un concepto con variantes
And la variante tiene mas de 10 ediciones guardades en el historial
When el usuario ingresa al sidepanel de la variante
And ingresa en la tab historial de cambios
Then puede scrollear hacia abajo hasta ver las 10 ediciones mas nuevas
And visualiza el boton cargar mas al fin del scroll
Then presiona el boton cargar mas cargando las proximas ediciones en orden cronológico
