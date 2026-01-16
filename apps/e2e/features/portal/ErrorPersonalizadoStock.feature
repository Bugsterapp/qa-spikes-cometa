Feature: Como colegio quiero mostrarle a mis clientes un mensaje personalizado de error para el manejo de stock al llegara a 0.

Scenario Outline: El tutor recibe un mensaje personalizado al intentar avanzar de la pantalla <pantalla> intentando pagar una sola orden opcional
Given exite tutor con estudiantes asignados
And los estudiantes tienen ordenes opcionales con stock = 1
When el tutor ingresa en portal
And selecciona una orden de concepto opcional
And avanza a pantalla <pantalla> y trato de avanzar a la siguiente
And se registra el pago desde dashboard para otro alumno de la misma orden
Then se muestra modal con el mensaje personalizado "Alguno de los conceptos a pagar ya no tiene stock disponible."

Examples:            
| pantalla                |
| resume pre pagar        |
| Elegir medio de pago    |
| Resumen compra          |
| pago realizado          |
| Confirmar Pago          |
| Datos Tarjeta Crédito o Débito |

Scenario Outline: El tutor recibe un mensaje personalizado al intentar avanzar de la pantalla <pantalla> intentando pagar varias ordenes
Given exite tutor con estudiantes asignados
And los estudiantes tienen ordenes opcionales con stock = 1
When el tutor ingresa en portal
And selecciona una orden de concepto opcional
And selecciona una orden de tipo colegiatura
And avanza a pantalla <pantalla> y trato de avanzar a la siguiente
And se registra el pago desde dashboard para otro alumno de la misma orden
Then se muestra modal con el mensaje personalizado "Alguno de los conceptos a pagar ya no tiene stock disponible."

Examples:            
| pantalla                |
| resume pre pagar        |
| Elegir medio de pago    |
| Resumen compra          |
| pago realizado          |
| Confirmar Pago          |
| Datos Tarjeta Crédito o Débito |
