
import {EncodingQuery, isAutoCountQuery, isFieldQuery} from 'compassql/build/src/query/encoding';
import {FieldQuery, ValueQuery} from 'compassql/build/src/query/encoding';
import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {isWildcard, SHORT_WILDCARD, Wildcard, WildcardProperty} from 'compassql/build/src/wildcard';
import {Axis} from 'vega-lite/build/src/axis';
import {Channel} from 'vega-lite/build/src/channel';
import {ValueDef} from 'vega-lite/build/src/fielddef';
import {Legend} from 'vega-lite/build/src/legend';
import {Mark as VLMark} from 'vega-lite/build/src/mark';
import {Scale} from 'vega-lite/build/src/scale';
import {SortField, SortOrder} from 'vega-lite/build/src/sort';
import {isBoolean} from 'vega-lite/build/src/util';
import {fromFieldQueryFunctionMixins, ShelfFunction, toFieldQueryFunctionMixins} from './function';

export * from './function';

/**
 * Identifier of shelf -- either a channel name for non-wildcard channel or
 * index number for wildcard channel.
 */
export type ShelfId = ShelfChannelId | ShelfWildcardChannelId;

export interface ShelfChannelId {
  channel: Channel;
};

export interface ShelfWildcardChannelId {
  channel: SHORT_WILDCARD | Wildcard<Channel>;
  index: number;
};

export function isWildcardChannelId(shelfId: ShelfId): shelfId is ShelfWildcardChannelId {
  return isWildcard(shelfId.channel);
}

export type ShelfMark = VLMark | SHORT_WILDCARD;


export type ShelfEncodingDef = ShelfFieldDef | ValueDef<string>;

export interface ShelfFieldDef {
  field: WildcardProperty<string>;

  fn?: ShelfFunction | Wildcard<ShelfFunction>;

  scale?: Scale;
  axis?: Axis;
  legend?: Legend;

  sort?: SortOrder | SortField;

  type?: ExpandedType;

  description?: string;
}


export interface ShelfAnyEncodingDef extends ShelfFieldDef {
  channel: SHORT_WILDCARD;
}

export type SpecificEncoding = {
  // TODO: ShelfFieldDef | ValueDef
  // (Just use ValueDef, no need for special ShelfValueDef)
  [P in Channel]?: ShelfFieldDef;
};

export function fromEncodingQueries(encodings: EncodingQuery[]): {
  encoding: SpecificEncoding, anyEncodings: ShelfAnyEncodingDef[]
} {
  return encodings.reduce((encodingMixins, encQ) => {
    if (isWildcard(encQ.channel)) {
      encodingMixins.anyEncodings.push({
        channel: encQ.channel,
        ...fromEncodingQuery(encQ)
      });
    } else {
      encodingMixins.encoding[encQ.channel] = fromEncodingQuery(encQ);
    }

    return encodingMixins;
  }, {encoding: {}, anyEncodings: []});
}


export function fromEncodingQuery(encQ: EncodingQuery): ShelfFieldDef {
  if (isFieldQuery(encQ)) {
    return fromFieldQuery(encQ);
  } else if (isAutoCountQuery(encQ)) {
    throw Error('AutoCount Query not yet supported');
  } else {
    return fromValueQuery(encQ);
  }
}

export function fromValueQuery(encQ: ValueQuery): ValueDef<any> {
  if (isWildcard(encQ.value)) {
    throw Error('Voyager does not support wildcard value');
  }
  return encQ;
}

export function toEncodingQuery(encDef: ShelfFieldDef | ValueDef<any>, channel: Channel | SHORT_WILDCARD): EncodingQuery {
  // TODO check type and do to ValueQuery
  return toFieldQuery(encDef, channel);
}

export function toFieldQuery(fieldDef: ShelfFieldDef, channel: Channel | SHORT_WILDCARD): FieldQuery {
  const {fn, ...fieldDefWithoutFn} = fieldDef;

  return {
    channel,
    ...toFieldQueryFunctionMixins(fn),
    ...fieldDefWithoutFn
  };
}

export function fromFieldQuery(fieldQ: FieldQuery): ShelfFieldDef {
  const {aggregate, bin, hasFn, timeUnit, field, type, scale, axis, legend, sort, description} = fieldQ;

  if (isWildcard(type)) {
    throw Error('Voyager does not support wildcard type');
  }

  const fn = fromFieldQueryFunctionMixins({aggregate, bin, timeUnit, hasFn});

  return {
    ...(fn ? {fn} : {}),
    field,
    type,
    ...(sort ? {sort} : {}),
    ...(scale ? {scale: fromFieldQueryNestedProp(fieldQ, 'scale')} : {}),
    ...(axis ? {axis: fromFieldQueryNestedProp(fieldQ, 'axis')} : {}),
    ...(legend ? {legend: fromFieldQueryNestedProp(fieldQ, 'legend')} : {}),
    ...(description ? {description} : {})
  };
}

export function fromFieldQueryNestedProp<P extends 'scale' | 'axis' | 'legend'>(
  fieldQ: FieldQuery, prop: P
): ShelfFieldDef[P] {
  const propQ = fieldQ[prop];
  if (!propQ) {
    return undefined;
  } else if (isWildcard(propQ)) {
    throw Error(`Voyager does not support wildcard ${prop}`);
  } else if (isBoolean(propQ)) {
    throw Error(`Voyager does not support boolean ${prop}`);
  } else {
    Object.keys(propQ).forEach(nestedProp => {
      if (isWildcard(propQ[nestedProp])) {
        throw Error(`Voyager does not support wildcard ${prop} ${nestedProp}`);
      }
    });
  }
  // We already catch all the unsupported types above so here we can just cast
  return propQ as ShelfFieldDef[P];
}
