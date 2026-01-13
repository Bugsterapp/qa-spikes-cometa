Feature: Como colegio queremos visualizar el detalle de las ordenes para los conceptos obligatorios, de sus ventas precio y fecha de vencimiento

Scenario: Usuario visualiza toda la lista de ordenes sin pagos realizados
Given existe un concepto obligatorio con varias ordenes
And el usuario puede ingresar al detalle de un concepto
When ingresa en la tab ordenes
Then se cargan la tabla de ordenes
And se visualiza 0 de x alumnos cobrados
And se visualiza la fecha de vencimiento de cada orden
And se visualiza el precio de cada orden

Scenario: Usuario visualiza toda la lista de ordenes con pagos realizados
Given existe un concepto obligatorio con varias ordenes
And el usuario puede ingresar al detalle de un concepto
And existen pagos completos para las ordenes
When ingresa en la tab ordenes
Then se cargan la tabla de ordenes
And se visualiza x de x alumnos cobrados

Scenario: Usuario ve actualizada las cobranzas luego de eliminar pago registrado por el colegio
Given existe un concepto obligatorio con varias ordenes
And el usuario puede ingresar al detalle de un concepto
And existen pagos completos para las ordenes
When ingresa en la tab ordenes
And valida cantidad de pagos para la orden
And puede eliminar 1 pago registrado por el colegio para la orden
And ingresa en la tab ordenes
Then visualiza el contador de ordenes pagas ya no cuenta el pago eliminado

Scenario: Se carga nombre tooltip al hacer hover sobre orden con nombre muy largo
Given existe un concepto obligatorio con varias ordenes con nombre de concepto de mas de 100 caracteres
And el usuario puede ingresar al detalle de un concepto
When ingresa en la tab ordenes
Then se trunca el la columna nombre
And al hacer hover sobre la orden se muestra tooltip con nombre completo

Scenario: Usuario contabilizan los pagos en proceso y parciales en la lista de ordenes
Given existe un concepto obligatorio con varias ordenes
And el usuario puede ingresar al detalle de un concepto
And existen pagos parciales y en proceso para las ordenes
When ingresa en la tab ordenes
Then se cargan la tabla de ordenes
And se visualiza x de x alumnos cobrados