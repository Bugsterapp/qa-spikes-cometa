Feature: Como tutor quiere poder gestionar mis pagos en proceso informando pagos, viendo los pagos vencidos y
regenerando las ordenes de pagos

Scenario: Tutor recibe notificacion de orden vencida
Dado que el tutor genera una orden de pago con medio de pago efectivo
Y tiene configurada la recepcion por whatsapp de notificaciones
Cuando pasaron 24 hs de la fecha de generacion de la orden
Y se ejecuta el proceso diario de notificaciones
Entonces se envia una notificacion al whatsapp del tutor recordando el pago pendiente

Scenario: Tutor informa el pago de una orden vencida por 1 dia
Dado que el tutor genera una orden de pago con medio de pago efectivo
Cuando pasaron 24 hs de la fecha de generacion de la orden
E ingresa en Pagos En proceso del portal
Y visualiza la card con la etiqueta Vencida y el boton Ya Pague habilitado
E informa el pago
Entonces se muestra el mensaje recordando el tiempo de impacto del pago
Y se oculta el boton Ya pague

Scenario: Tutor ve en pagos en proceso leyenda de pago en revision luego de 48hs
Dado que el tutor genera una orden de pago con medio de pago efectivo
E Informa el pago desde pagos en proceso 
Cuando pasaron 48 hs de la fecha que informo el pago
E ingresa en Pagos En proceso del portal
Entonces visualiza la orden indicando que su pago esta en revision

Scenario: Tutor regenera una orden vencida que aun no recibio confirmacion de kushki
Dado que el tutor genera una orden de pago con medio de pago efectivo
Y pasaron 24 hs de la fecha de generacion de la orden
Cuando ingresa en Pagos en proceso del portal
Y visualiza la card con la etiqueta Vencida y el boton regenera orden de pago habilitado
Y regenera la orden pago con exito
Entonces se cancela el pago en proceso y se crea inmediatamente un nuevo pago con la fecha a día de hoy

Scenario: Tutor informa el pago de una orden aun no vencida
Dado que el tutor genera una orden de pago con medio de pago efectivo
Cuando aun no pasaron 24 hs de la fecha de generacion de la orden
E ingresa en Pagos En proceso del portal
Y visualiza la card de pago en proceso vigente y el boton Ya Pague habilitado
E informa el pago
Entonces se muestra el mensaje recordando el tiempo de impacto del pago
Y se oculta el boton Ya pague

Scenario: Tutor recibe mensaje notificacion de pago iniciado de varias ordenes
Dado que el tutor tiene 2 o mas ordenes por pagar
Y tiene configurada la recepcion por whatsapp de notificaciones
Cuando completa el proceso de pago en efectivo 2 o mas ordenes
Entonces recibe una notificacion indicando que se genero la orden de pago y recordando el tiempo limite que tiene para pagar

Scenario: Kushki informa con demoras el pago de una orden vencida
Dado que existe una orden en efectivo vencida y paga en tiempo y forma por el Tutor
Cuando se recibe la actualización de Kushki
Entonces se actualiza el estado a paga de la orden
Y el tutor visualiza la orden en Historial de pagos