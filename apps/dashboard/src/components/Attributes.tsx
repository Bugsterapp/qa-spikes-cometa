// --- Imports ---

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

import Button from './organisms/dashboard/Button';
import NRadioGroup from './organisms/dashboard/RadioGroup';
import MoneyInput from './ui/MoneyInput';
import CustomInput from './CustomInput';
import ConceptButton from './organisms/dashboard/ConceptButton';
import TextField from '/src/components/CustomFormTexField';
import { FormValues6, StepProps } from './organisms/dashboard/CreationConcepts';

import TrashIcon from '/public/assets/icons/trash_outline.svg';
import IcEdit from 'public/assets/icons/ic_edit.svg';
import PlusIcon from '/public/assets/icons/ic_plus.svg';

import { cn } from '../utils/cn';
import useSendTrackEventWithUserName from '../hooks/useSendTrackEventWithUserName';

// Type Definitions

type AttributeItemsType = {
  onDelete: (index: number) => void;
  register?: any;
  itemIndex?: number;
  watch?: any;
};

type AttributesListType = {
  attribute: DataType;
  onEdit: (type: string) => void;
  createAndEdit: boolean;
};

type ItemType = {
  id: string;
  name: string;
};

export type DataType = {
  type: string;
  items: ItemType[];
};

type attributesCardType = {
  attributes: DataType[];
  className?: string;
  selectedType?: string;
  createAndEdit?: boolean;
  setCreateAndEdit?: (value: boolean) => void;
  setData: (newItems: ItemType[], type: string) => void;
  removeAttribute: (type: string) => void;
};
const StepAttributesCreate = ({
  onNext,
  onBack,
  setData,
  formData,
  setAttributeSinglePrice,
  isSubmitting,
}: StepProps<FormValues6> & {
  setAttributeSinglePrice: React.Dispatch<React.SetStateAction<number>>;
  isSubmitting: boolean;
}) => {
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  sendTrackEventWithUserName('dashboard: Concept | New Concept P2B.1 Atributos');
  const [flowDirection, setFlowDirection] = useState('');
  const [createAndEdit, setCreateAndEdit] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [singleOrderPrice, setSingleOrderPrice] = useState(0);
  const [attributes, setAttributes] = useState<DataType[]>(formData?.attributes || []);
  const [originalType, setOriginalType] = useState('');

  const handleEdit = (type: string) => {
    setOriginalType(type);
    setCreateAndEdit(true);
    setSelectedType(type);
  };

  const onSubmit = (data: FormValues6) => {
    onNext(data);
    setData(data);
  };

  const handleBack = () => {
    onBack();
    setData({ attributes: attributes, price: singleOrderPrice || 0 });
  };

  const saveAttribute = (newItems: ItemType[], type: string) => {
    // If the type is empty or undefined, return without making any changes
    if (!type || type.trim() === '') return;

    const newAttributes = [...attributes];

    // If the type was edited, remove the original attribute
    const originalAttributeIndex = originalType
      ? newAttributes.findIndex((attribute) => attribute.type === originalType)
      : -1;
    if (originalAttributeIndex > -1) {
      newAttributes.splice(originalAttributeIndex, 1);
    }

    const existingAttributeIndex = newAttributes.findIndex((attribute) => attribute.type === type);
    if (existingAttributeIndex > -1) {
      newAttributes[existingAttributeIndex] = { ...newAttributes[existingAttributeIndex], items: newItems };
    } else {
      // Insert at the original position or push to the end if originalType wasn't set.
      const insertPosition = originalAttributeIndex > -1 ? originalAttributeIndex : newAttributes.length;
      newAttributes.splice(insertPosition, 0, { type, items: newItems });
    }

    const filteredAttributes = newAttributes.filter((attr) => attr.type !== '');

    setAttributes(filteredAttributes);
  };

  const removeAttribute = (typeToRemove: string) => {
    const newAttributes = attributes.filter((attribute) => attribute.type !== typeToRemove);
    setAttributes(newAttributes);
    setSelectedType('');
    setCreateAndEdit(false);
  };

  const handleNewAttribute = () => {
    // Create a placeholder attribute
    const placeholderAttribute = {
      type: '', // Placeholder type
      items: [], // Empty items array
    };
    setAttributes([...attributes, placeholderAttribute]);
    setCreateAndEdit(true);
    setSelectedType(''); // Set selected type to empty to indicate it's a new attribute
  };

  useEffect(() => {
    if (flowDirection === 'Sí' && attributes.length === 0) {
      setSelectedType('');
      setCreateAndEdit(true);
    }
  }, [attributes.length, flowDirection]);

  useEffect(() => {
    setAttributeSinglePrice(singleOrderPrice);
  }, [singleOrderPrice]);

  return (
    <>
      <div className="flex flex-col gap-4 min-h-[79vh] mb-6">
        <div className="pt-5 pb-6 bg-white sticky top-0 z-20">
          <h6 className="text-black text-2xl font-bold">Atributos y opciones</h6>
          <span className="text-sm text-[#637381]">
            Agrega atributos como tamaño, color o cualquier característica que tenga tu concepto.
          </span>
          <span id="divider" className="border-b border-[#919EAB3D] w-full block mt-6" />
        </div>
        <span className="text-black font-semibold">
          ¿Quieres agregar atributos para este concepto?
          <span className="italic font-normal text-[#637381]"> ejemplo: Tallas, colores, logos, etc.</span>
        </span>

        <NRadioGroup options={['Sí', 'No']} value={flowDirection} className="px-4 pb-2" onChange={setFlowDirection} />
        {flowDirection === 'No' && (
          <MoneyInput
            value={Number(singleOrderPrice)}
            onChange={(value) => setSingleOrderPrice(+value)}
            prefix="MXN"
            label="Precio del concepto"
          />
        )}

        {flowDirection === 'Sí' && attributes.length > 0 && attributes.length <= 3 && (
          <>
            {attributes.map((attribute) => (
              <AttributesList
                key={attribute.type}
                attribute={attribute}
                onEdit={handleEdit}
                createAndEdit={createAndEdit}
              />
            ))}
          </>
        )}
        {flowDirection === 'Sí' && createAndEdit && (
          <AttributesCard
            attributes={formData?.attributes || attributes}
            selectedType={selectedType}
            createAndEdit={createAndEdit}
            setCreateAndEdit={setCreateAndEdit}
            setData={saveAttribute}
            removeAttribute={removeAttribute}
          />
        )}
        {flowDirection === 'Sí' && !createAndEdit && attributes.length >= 1 && attributes.length < 3 && (
          <button
            className="bg-white w-[210px] h-9 border border-[#00AB557A] rounded-lg flex items-center justify-center gap-2 flex-row px-2 mt-2"
            onClick={() => handleNewAttribute()}
          >
            <PlusIcon className="w-5 h-5" fill="#00AB55" />
            <span className="text-[#00AB55] text-sm font-bold">Agregar más atributos</span>
          </button>
        )}
      </div>
      <ConceptButton
        className="sticky bottom-0 z-30"
        onBack={() => {
          handleBack();
        }}
        onSubmit={() => {
          onSubmit({ attributes: attributes, price: singleOrderPrice || 0 });
        }}
        disabledNext={
          (flowDirection === 'No' && !singleOrderPrice) ||
          (flowDirection === 'Sí' && !attributes.length) ||
          (createAndEdit && flowDirection === 'Sí' && attributes.length > 0) ||
          flowDirection === '' ||
          isSubmitting
        }
        data-testid="concept-button"
      />
    </>
  );
};

export const AttributesCard = ({
  attributes,
  className,
  createAndEdit,
  selectedType,
  setCreateAndEdit,
  setData,
  removeAttribute,
}: attributesCardType) => {
  const [currentAttribute, setCurrentAttribute] = useState(
    attributes.find((attr) => attr.type === selectedType) || {
      type: '',
      items: [],
    }
  );

  const schema = z.object({
    attribute: z
      .object({
        type: z.string().nonempty({ message: 'El tipo de atributo es requerido' }),
        items: z
          .array(z.object({ id: z.string(), name: z.string() }))
          .nonempty({ message: 'Debe agregar minimo un item' }),
      })
      .refine(
        (data) =>
          // we sure check if the type is not included in the attributes in order to avoid duplicated types
          !attributes.find((attr) => attr.type === data.type && data.type !== currentAttribute.type),
        { message: 'El tipo de atributo ya existe', path: ['type'] }
      ),
  });
  const { register, watch, handleSubmit, setValue, formState, clearErrors } = useForm({
    defaultValues: { attribute: currentAttribute },
    resolver: zodResolver(schema),
  });
  const [newItem, setNewItem] = useState('');

  const addNewItem = () => {
    if (!newItem || newItem.trim() === '') return;

    const newAttributeItem = { id: uuidv4(), name: newItem };
    const updatedItems = [...currentAttribute.items, newAttributeItem];

    // Update the form state
    setValue('attribute.items', updatedItems);

    // Update the currentAttribute state
    setCurrentAttribute((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    setNewItem('');
  };

  const handleCancel = () => {
    if (currentAttribute.type === '') {
      removeAttribute(currentAttribute.type);
    }
    setCreateAndEdit?.(!createAndEdit);
  };

  const onFormSubmit = (data: any) => {
    const { attribute } = data;
    setData(attribute.items, attribute.type);
    setCreateAndEdit?.(!createAndEdit);
  };

  const removeItem = (itemIndex: number) => {
    const updatedItems = [...currentAttribute.items];
    updatedItems.splice(itemIndex, 1);
    setValue('attribute.items', updatedItems);

    setCurrentAttribute((prev) => ({
      ...prev,
      items: updatedItems,
    }));
    setData(updatedItems, currentAttribute.type);
  };
  const focusStyles = formState.errors.attribute?.items?.message
    ? 'focus-within:ring-red-500 focus-within:hover:ring-red-500 focus-within:ring-[1.5px]'
    : 'focus-within:ring-green focus-within:hover:ring-green focus-within:ring-[1.5px]';

  const textFieldClasses = cn('w-[90%] p-2 group mb-5 mt-2', focusStyles);

  useEffect(() => {
    formState.errors.attribute && setTimeout(() => clearErrors('attribute'), 3000);
  }, [formState.errors.attribute, clearErrors, currentAttribute, attributes, selectedType, createAndEdit]);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
      <div className={cn('border rounded-lg border-[#DFE3E8] p-4', className)}>
        <span className="text-black font-semibold">Selecciona o crea un atributo para el concepto:</span>
        <TextField
          label="Talla, color, estilo, etc..."
          className={textFieldClasses}
          value={watch('attribute.type')}
          // @ts-ignore
          error={formState.errors.attribute?.type?.message}
        >
          <CustomInput autoComplete="off" className="peer" {...register('attribute.type')} />
        </TextField>
        <div className="mb-2">
          <span className="text-black font-semibold">¿Cuáles son las opciones que tendrá el atributo?</span>
        </div>
        {currentAttribute.items &&
          currentAttribute.items.map((_, itemIndex) => (
            <AttributeItem
              key={itemIndex}
              register={register}
              itemIndex={itemIndex}
              onDelete={removeItem}
              watch={watch}
            />
          ))}
        <TextField
          className={textFieldClasses}
          label="Agrega otra opción"
          value={newItem}
          error={formState.errors.attribute?.items?.message}
        >
          <CustomInput
            autoComplete="off"
            className="peer"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => (e.key === 'Tab' || e.key === 'Enter') && addNewItem()}
            onBlur={() => newItem.length > 0 && addNewItem()}
          />
        </TextField>

        {newItem.length > 0 && (
          <input
            type="button"
            value="Agrega otra opción"
            className={cn(
              'w-[90%] px-4 py-2.5 border border-[#919EAB52] group mb-5 rounded-lg text-[#919EAB] text-start focus-within:ring-green focus-within:hover:ring-green focus-within:ring-[1.5px]'
            )}
            onClick={() => addNewItem()}
          />
        )}

        <div className="flex justify-between items-center py-2">
          <div className="flex justify-start gap-2">
            <Button
              variant="ghost"
              size="small"
              className="text-green text-sm"
              onClick={() => handleCancel()}
              disabled={formState.isSubmitting || attributes.length === 0}
            >
              {createAndEdit ? 'Cancelar' : 'Regresar'}
            </Button>
            <Button variant="primary" size="small" className="text-sm round-lg" type="submit">
              Guardar
            </Button>
          </div>
          {attributes.length > 0 && (
            <button
              className={cn('flex gap-2 mt-1 px-2', {
                'opacity-[0.6]': attributes.length === 0,
              })}
              onClick={() => removeAttribute(currentAttribute.type)}
            >
              <span className="text-[13px] font-bold text-red-500 cursor-pointer">Eliminar</span>
              <TrashIcon className={cn('w-5 cursor-pointer text-red-500')} />
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export const AttributeItem = ({ onDelete, register, itemIndex, watch }: AttributeItemsType) => {
  const handleDelete = () => {
    onDelete(itemIndex || 0);
  };
  return (
    <div className="flex items-center justify-between gap-3">
      <TextField
        className="w-full p-2 focus-within:ring-green focus-within:hover:ring-green focus-within:ring-[1.5px] group mb-3"
        value={watch('attribute.items[${itemIndex}].name')}
        errorClassNames="-left-1/3"
      >
        <CustomInput autoComplete="off" className="peer" {...register(`attribute.items[${itemIndex}].name`)} />
      </TextField>
      <div className="p-2 flex items-center justify-center">
        <TrashIcon onClick={() => handleDelete()} className={cn('w-5 pb-4 cursor-pointer')} />
      </div>
    </div>
  );
};

export const AttributesList = ({ attribute, onEdit, createAndEdit }: AttributesListType) => (
  <>
    {attribute.type !== '' && (
      <div className="border rounded-lg border-[#DFE3E8] p-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-black font-semibold">{attribute.type}</span>
          <button
            className={cn('flex flex-row items-center pr-2 text-center bg-transparent', {
              'opacity-[0.6]': createAndEdit,
            })}
            onClick={() => onEdit(attribute.type)}
            disabled={createAndEdit}
          >
            <div className="m-2">
              <IcEdit fill="#00AB55" />
            </div>
            <span className="text-sm font-bold text-green cursor-pointer">Editar</span>
          </button>
        </div>
        <div className="flex flex-row gap-2 flex-wrap">
          {attribute.items?.map((item) => (
            <span key={item.id} className="text-sm py-[5px] px-3 max-h-[32px] bg-[#919EAB29] rounded-[50px]">
              {item.name}
            </span>
          ))}
        </div>
      </div>
    )}
  </>
);

export default StepAttributesCreate;
