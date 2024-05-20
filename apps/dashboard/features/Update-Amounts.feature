Feature: Como colegio queremos recalcular los montos de ordenes o fullfilments por pagar ante los siguiente escenarios

Scenario Outlines: Se edita un concepto desde admin y se agrega interest schema lo que actualiza el monto base.
Given existe un alumno con concepto con fullfilments asociados
And el concepto no tiene configurado interest schema
And se vencio el fullfilment por pagar
When se le edita al concepto desde admin el campo interest schema <schema>
Then se actualiza el monto original del fullfilment

Examples:
| compounding type       | Type     | Monto Base Original | Monto Base  final | interes aplicado |
|   SINGLE               | PERCENT  |   1000              | 1100              | 10%              |
|   DAILY                | PERCENT  |   1000              | 1100              | 10%              |
|   WEEKLY               | PERCENT  |   1000              | 1100              | 10%              |
|  BIWEEKLY              | PERCENT  |   1000              | 1100              | 10%              |
|    MONTHLY             | PERCENT  |   1000              | 1100              | 10%              |
|   SINGLE               | MONTO    |   1000              | 1200              | 200              |
|   DAILY                | MONTO    |   1000              | 1200              | 200              |
|   WEEKLY               | MONTO    |   1000              | 1200              | 200              |
|  BIWEEKLY              | MONTO    |   1000              | 1200              | 200              |
|    MONTHLY             | MONTO    |   1000              | 1200              | 200              |

Scenario Outlines: Se modifica el monto base si aplico una schollarship al alumno y el campo discount_order = EB_IN_SC_SD, 
                   fecha vencimiento es <= hoy
Given existe un alumno con concepto con fullfilments asociados
And el campo Scholarship is accumulative es <Scholarship is accumulative>
When asigno beca <schollarship 1> que aplica a ese concepto
Then se actualiza el monto base a 2700 mxn 
When asigno beca <schollarship 2> que aplica a ese concepto
Then se recalcula el monto base 2100 MXN

Examples:
| schollarship 1 | schollarship 2 | monto original | monto base final  |  Scholarship is accumulative  |
|      10%       |       20%      |    3000        |     2100          |  false                        |
|      10%       |       20%      |    3000        |     2160          |  true                         |

Scenario: Al vencer un fullfilment se actualiza el monto base si pierde una beca
Given existe un alumno con concepto con fullfilments asociados
And fullfiment no esta vencido
And el concepto no tiene configurado interes
And el estudiannte tiene configurada la beca <schollarship 1>
And tiene una orden por pagar por monto <monto base con beca>
And Scholarship lost config = not_lost
When se vence el fullfilment
Then se actualiza el monto base a <monto base final>

| schollarship 1 | monto base final | monto base con beca  |
|      10%       |    3000          |     2700             |

Scenario: Se modifica el monto base cuando un tutor realiza un pago parcial

Scenario: No se aplican intereses si se hace un pago parcial antes del vencimiento y la property partial_payment_interest_freeze = true
Given existe un alumno con concepto con fullfilments asociados
And fullfiment no esta vencido
When el tutor realiza un pago parcial
And se actualiza el monto pendiente 
And Se vence el fullfilment
Then no se agregan intereses al monto base  