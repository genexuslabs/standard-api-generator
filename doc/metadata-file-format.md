# Input metadata file format

The input metadata must have the following format:

```javascript
{
  definitions: IMetadataEntry[]
}
```

```TypeScript
interface IMetadataEntry {
  name: string;
  description: string;
  methods?: IMethod[];
  properties?: IProperty[];
  events?: IEvent[];
}

interface IMethod {
  name: string;
  parameters?: IParameter[];
  description: string;
  returns?: string;
  deprecated?: boolean;
  static?: boolean;
  scope: string[];
}

interface IProperty {
  name: string;
  type: string;
  readonly: boolean;
  description: string;
  deprecated?: boolean;
  static?: boolean;
}

interface IEvent {
  name: string;
  parameters?: IParameter[];
  description: string;
  deprecated?: boolean;
  static?: boolean;
}

interface IParameter {
  name: string;
  type: string;
  description: string;
  accesstype: string;
  optional?: boolean;
}
```