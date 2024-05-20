Feature: Como tutor quiero visuallizar el historial de pagos ordenado por de fecha de pago y ordenado del 
pago mas reciente al mas antiguo.

Scenario: Tutor visualiza su ultimo pago  en la parte superior del historial de pagos 
Dado que un tutor realizo el pago de una orden desde portal
When el tutor ingresa a seccion historial de pagos
Then ve la primer card con la fecha del pago y el id de pago
And puede desplegar el detalle de la card
And visualiza los datos de las ordenes pagadas agrupadas por alumno y lista de ordenes pagas

Scenario Outline: Tutor visualiza su ultimo pago  en la parte superior del historial de pagos 
Dado que un tutor realizo el pago de una orden desde portal
When el tutor ingresa a seccion historial de pagos
Then ve la primer card con la fecha del pago y el id de pago
And puede desplegar el detalle de la card
And visualiza los datos de las ordenes pagadas agrupadas por alumno y lista de ordenes pagas

Examples:
| cantidad-alumnos | Ordenes  |
|   1              |    1     |
|   1              |    2     |
|   1              |    10    |
|   2              |    1     |
|   2              |    2     |
|   2              |    10    |

Scenario: Tutor ingresa al detalle de un pago con tarjeta de credito desde el portal desde el historial de pagos de 2 ordenes
Dado que un tutor realizo el pago de una orden desde portal
When el tutor ingresa a seccion historial de pagos
And ve la primer card con la fecha del pago y el id de pago
And puede desplegar el detalle de la card
Then puede tappear en el pago y es redireccionado al detalle del pago
And en el detalle visualiza nombre pagador
And en el detalle visualiza Medio de pago tarjeta
And en el detalle visualiza lugar de pago portal de pagos
And en desde el detalle puede descargar el recibo
And en el detalle visualiza una card por cada orden paga con el nombre de orden
And la card tiene el nombre estudiante 
And la card tiene el monto pagado
And la card tiene el estado de la factura
And la card tiene un boton para desplegar la orden y ver el detalle

Scenario: Tutor visualiza el detalle de una orden pagada desde detalle de un pago con tarjeta de credito 
Dado que un tutor realizo el pago de una orden desde portal
When el tutor ingresa a seccion historial de pagos
And ve la primer card con la fecha del pago y el id de pago
And puede desplegar el detalle de la card
Then puede tappear en el pago y es redireccionado al detalle del pago
And puede desplegar la card de la orden paga
And en el detalle de la card visualiza nombre de la orden

Scenario: Tutor visualiza la lista de pagos en el hitorial paginacion por tener mas de <pagos-realizados> 
Dado que un tutor realizo <pagos-realizados> pagos desde portal
When el tutor ingresa a seccion historial de pagos
And ve la primer card con la fecha del pago y el id de pago
And al scrollear 20 cards de pagos
Then visualiza paginado 1 a <cantidad-paginas> para cargar los siguiente n a 20 cards de pagos

Examples:
|pagos-realizados| cantidad-paginas |
|     20         |     NA           |
|     40         |     2            |
|     80         |     4            | 


