declare type Maybe<Type> = Type | undefined

declare type Nullable<Type> = Type | null

declare type EmptyObject = Record<string, never>

declare type AnyObject = object

declare type Include<Base, Subtype> = Base extends Subtype ? Base : never
