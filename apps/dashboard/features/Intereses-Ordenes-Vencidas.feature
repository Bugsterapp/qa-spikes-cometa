Feature: Como colegio queremos poder agregar interes por mora a las ordenes pagos fuera de termino 

Scenario Outlines: Tutor tiene una orden con 1 periodo vencido y se le agrega el interes porcentual
Given Existe un estudiante con una orden que pasaron {days-over-due} dias del vencimiento.
And se aplica el recargo del concepto cada {Aplicacion-Recargo}
And no tiene recargos especiales
And no tiene becas asignadas
When pasaron {days-over-due} del dia de venciento a la orden
Then se calcula el interes a la orden y se visualiza en el detalle de la orden el {interes}

Examples:
| days-over-due       | interes | Aplicacion-Recargo    |
| 30                  |    20      |  mensual           |
| 15                  |    10      |   15 dias          |
| 1                   |    10      |    diario          |

Scenario Outlines: Tutor tiene una orden con 2 periodo vencido y se le agrega el interes porcentual acumulativo
Given Existe un estudiante con una orden que pasaron {days-over-due} dias del vencimiento.
And se aplica el recargo del concepto cada {Aplicacion-Recargo}
And no tiene recargos especiales
And no tiene becas asignadas
When pasaron {days-over-due} del dia de venciento a la orden
Then se calcula el interes a la orden y se visualiza en el detalle de la orden el {interes}

Examples:
| days-over-due       | interes    | Aplicacion-Recargo | 
| 60                  |    20      |  mensual           |
| 20                  |    10      |   15 dias          |
| 2                   |    10      |    diario          |

Scenario Outlines: Tutor tiene una orden con 1 periodo vencido y se le agrega el interes monto
Given Existe un estudiante con una orden que pasaron {days-over-due} dias del vencimiento.
And se aplica el recargo del concepto cada {Aplicacion-Recargo}
And no tiene recargos especiales
And no tiene becas asignadas
When pasaron {days-over-due} del dia de venciento a la orden
Then se calcula el interes a la orden y se visualiza en el detalle de la orden sumando el {monto}

Examples:
| days-over-due       | monto      | Aplicacion-Recargo |
| 30                  |    20      |  mensual           |
| 15                  |    10      |   15 dias          |
| 1                   |    10      |    diario          |

Scenario Outlines: Tutor tiene una orden con 2 periodos vencidos y se le agrega el interes porcentual acumulativo
Given Existe un estudiante con una orden que pasaron {days-over-due} dias del vencimiento.
And se aplica el recargo del concepto cada {Aplicacion-Recargo}
And no tiene recargos especiales
And no tiene becas asignadas
When pasaron {days-over-due} del dia de venciento a la orden
Then se calcula el interes a la orden y se visualiza en el detalle de la orden sumando el {monto}

Examples:
| days-over-due       | monto      | Aplicacion-Recargo |
| 60                  |    20      |  mensual           |
| 20                  |    10      |   15 dias          |
| 2                   |    10      |    diario          |

Scenario Outlines: Tutor tiene una orden con 1 periodo vencido y se agrega un recargo especial que tambien agrega intereses
Given Existe un estudiante con una orden que pasaron {days-over-due} dias del vencimiento.
And se aplica el recargo del concepto cada {Aplicacion-Recargo}
And no tiene recargos especiales
And no tiene becas asignadas
When pasaron {days-over-due} del dia de venciento a la orden
And se calcula el interes a la orden y se visualiza en el detalle de la orden el {interes}
And se agrega un recargo especial 
Then se recalcula el monto a pagar total y se recalcula los interes para ese nuevo monto

Examples:
| days-over-due       | interes    | Aplicacion-Recargo    |
| 30                  |    20      |  mensual              |
| 15                  |    10      |   15 dias             |
| 1                   |    10      |    diario             |