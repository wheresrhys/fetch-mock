const valueTypes = new Set([ 'boolean', 'number', 'null', 'string', 'undefined' ]);
const referenceTypes = new Set([ 'array', 'function', 'object', 'symbol' ]);

const detectableTypes = new Set([ 'boolean', 'function', 'number', 'string', 'symbol' ]);
const typeConstructors = new Set([ Boolean, Number, String ]);

class TypeDescriptor {
  public name: string;

  public isValueType: boolean;

  public isReferenceType: boolean;

  public isArray: boolean;

  public isBoolean: boolean;

  public isFunction: boolean;

  public isNull: boolean;

  public isNumber: boolean;

  public isObject: boolean;

  public isString: boolean;

  public isSymbol: boolean;

  public isUndefined: boolean;

  protected constructor (value: any) {
    this.name = TypeDescriptor.of(value);

    this.isValueType = TypeDescriptor.isValueType(value);
    this.isReferenceType = TypeDescriptor.isReferenceType(value);
    this.isArray = TypeDescriptor.isArray(value);
    this.isBoolean = TypeDescriptor.isBoolean(value);
    this.isFunction = TypeDescriptor.isFunction(value);
    this.isNull = TypeDescriptor.isNull(value);
    this.isNumber = TypeDescriptor.isNumber(value);
    this.isObject = TypeDescriptor.isObject(value);
    this.isString = TypeDescriptor.isString(value);
    this.isSymbol = TypeDescriptor.isSymbol(value);
    this.isUndefined = TypeDescriptor.isUndefined(value);
  }

  public static of (value: any): string {
    if (value === null) {
      return 'null';
    }
    if (value === undefined) {
      return 'undefined';
    }

    const detectedType = typeof value;

    if (detectableTypes.has(detectedType)) {
      return detectedType;
    }

    if (detectedType === 'object') {
      if (Array.isArray(value)) {
        return 'array';
      }

      if (typeConstructors.has(value.constructor)) {
        return value.constructor.name.toLowerCase();
      }

      return detectedType;
    }

    throw new Error('Failed due to an unknown type.');
  }

  public static from (value: any): TypeDescriptor {
    return new TypeDescriptor(value);
  }

  public static isValueType (value: any): value is boolean | number | null | string | undefined {
    return valueTypes.has(TypeDescriptor.of(value));
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static isReferenceType (value: any): value is any[] | Function | object | symbol {
    return referenceTypes.has(TypeDescriptor.of(value));
  }

  public static isArray (value: any): value is any[] {
    return TypeDescriptor.of(value) === 'array';
  }

  public static isBoolean (value: any): value is boolean {
    return TypeDescriptor.of(value) === 'boolean';
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static isFunction (value: any): value is Function {
    return TypeDescriptor.of(value) === 'function';
  }

  public static isNull (value: any): value is null {
    return TypeDescriptor.of(value) === 'null';
  }

  public static isNumber (value: any): value is number {
    return TypeDescriptor.of(value) === 'number';
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static isObject (value: any): value is object {
    return TypeDescriptor.of(value) === 'object';
  }

  public static isString (value: any): value is string {
    return TypeDescriptor.of(value) === 'string';
  }

  public static isSymbol (value: any): value is symbol {
    return TypeDescriptor.of(value) === 'symbol';
  }

  public static isUndefined (value: any): value is undefined {
    return TypeDescriptor.of(value) === 'undefined';
  }
}

export { TypeDescriptor as Type };
