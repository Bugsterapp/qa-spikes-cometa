Feature: Como colegio queremos visualizar en un grafico y tablas las cobranza y necesitamos por aplicar filtros por tipo de concepto, ciclo y concepto para
ajustar las busquedas

Scenario: Empty state filtro escolar su no existen ciclos cargados para el colegio
Given existe una escuela XXX
And no tiene un ciclo creado
When el colegio ingresa en seccion cobranzas
Then se muestra empty state y se desactivan los filtros

Scenario: Empty state filtro escolar si se obtiene un error de la api
Given existe una escuela XXX
And tiene un ciclo creado para el ciclo
When el colegio ingresa en seccion cobranzas
And retorna un error la api que devuelve los ciclos
Then se muestra empty state y se desactivan los filtros

Scenario: Colegio no puede elegir Otros en el filtro tipo de concepto
Given existe una escuela XXX
And tiene un ciclo creado para el ciclo
And no se creo ningun concepto asociado al tipo de concepto Otros
When el colegio ingresa en seccion cobranzas
And despliega el filtro Tipo de concepto
Then no se visualizar el tipo de concepto Otros en las opciones

Scenario: Se visualizan todos los conceptos asociados al tipo de concepto del ciclo que tiene alumnos asociados y vienen seleccionados por defecto
Given existe una escuela XXX
And tiene el ciclo 23/24 creado
And se creo el concepto Colegiatura Ingles asociado al tipo de concepto Colegiaturas / Mensualidades para el ciclo 23/24
And se creo el concepto Colegiatura Primaria asociado al tipo de concepto Colegiaturas / Mensualidades para el ciclo 23/24
And se asocian ambos conceptos a 1 alumno
When el colegio ingresa en seccion cobranzas
And elige del filtro ciclo la opción 23/24
And elige del filtro Tipo de concepto la opción Merchs and Uniforms
And despliega el filtro Concepto
Then se despliegan las opciones Colegiatura Ingles y Colegiatura Primaria

Scenario: Colegio no puede elegir Libros en el filtro Concepto si no esta asignado a un estudiante
Given existe una escuela XXX
And tiene el ciclo 23/24 creado
And se creo el concepto Libros asociado al tipo de concepto Merchs and Uniforms para el ciclo 23/24
And no se asocio a ningun alumno
When el colegio ingresa en seccion cobranzas
And elige del filtro ciclo la opción 23/24
And elige del filtro Tipo de concepto la opción Merchs and Uniforms
And despliega el filtro Concepto
Then no visualiza el concepto Libros

Scenario: Mostrar los nombres de conceptos seleccionados por coma en el copy del desplegable
Given existe una escuela XXX
And tiene el ciclo 23/24 creado
And se creo el concepto Libros asociado al tipo de concepto Merchs and Uniforms para el ciclo 23/24
And se creo el concepto Colegiatura Ingles asociado al tipo de concepto Colegiaturas / Mensualidades para el ciclo 23/24
And se creo el concepto Colegiatura Primaria asociado al tipo de concepto Colegiaturas / Mensualidades para el ciclo 23/24
And se asociaron a 1 alumno
When el colegio ingresa en seccion cobranzas
And elige del filtro ciclo la opción 23/24
And elige del filtro Tipo de concepto la opción Merchs and Uniforms
And despliega el filtro Concepto
And selecciona los conceptos de tipo colegiatura
Then la opcion seleccionar todo pasa a estado indefinido
And se muestran los conceptos elegidos separados por comas 

Scenario: Deseleccionar todos los conceptos desde opcion deseleccionar todos
Given existe una escuela XXX
And tiene el ciclo 23/24 creado
And se creo el concepto Libros asociado al tipo de concepto Merchs and Uniforms para el ciclo 23/24
And se creo el concepto Colegiatura Ingles asociado al tipo de concepto Colegiaturas / Mensualidades para el ciclo 23/24
And se creo el concepto Colegiatura Primaria asociado al tipo de concepto Colegiaturas / Mensualidades para el ciclo 23/24
And se asociaron a 1 alumno
When el colegio ingresa en seccion cobranzas
And elige del filtro ciclo la opción 23/24
And elige del filtro Tipo de concepto la opción Merchs and Uniforms
And despliega el filtro Concepto
And deselecciona opcion Seleccionar todo
Then se desmarcan todos los checkbox.