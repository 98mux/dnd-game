/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Beats = "beats",
	Characters = "characters",
	Choices = "choices",
	GameInstances = "gameInstances",
	Games = "games",
	ItemInstances = "itemInstances",
	Items = "items",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type BeatsRecord = {
	created?: IsoDateString
	gameId?: RecordIdString
	gameInstanceId?: RecordIdString
	id: string
	updated?: IsoDateString
}

export type CharactersRecord = {
	charisma?: number
	constitution?: number
	created?: IsoDateString
	dexterity?: number
	id: string
	intelligence?: number
	strength?: number
	updated?: IsoDateString
	userId?: RecordIdString
	wisdom?: number
}

export type ChoicesRecord = {
	created?: IsoDateString
	id: string
	stat?: string
	statAmount?: number
	text?: string
	updated?: IsoDateString
}

export type GameInstancesRecord = {
	created?: IsoDateString
	gameId?: RecordIdString
	id: string
	updated?: IsoDateString
	userId?: RecordIdString
}

export type GamesRecord = {
	created?: IsoDateString
	description?: string
	id: string
	itemIds?: RecordIdString
	prompt?: string
	title?: string
	updated?: IsoDateString
}

export type ItemInstancesRecord = {
	created?: IsoDateString
	id: string
	image?: string
	itemId?: RecordIdString
	updated?: IsoDateString
}

export type ItemsRecord = {
	created?: IsoDateString
	description?: string
	gameId?: RecordIdString
	id: string
	name?: string
	updated?: IsoDateString
}

export type UsersRecord = {
	avatar?: string
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type BeatsResponse<Texpand = unknown> = Required<BeatsRecord> & BaseSystemFields<Texpand>
export type CharactersResponse<Texpand = unknown> = Required<CharactersRecord> & BaseSystemFields<Texpand>
export type ChoicesResponse<Texpand = unknown> = Required<ChoicesRecord> & BaseSystemFields<Texpand>
export type GameInstancesResponse<Texpand = unknown> = Required<GameInstancesRecord> & BaseSystemFields<Texpand>
export type GamesResponse<Texpand = unknown> = Required<GamesRecord> & BaseSystemFields<Texpand>
export type ItemInstancesResponse<Texpand = unknown> = Required<ItemInstancesRecord> & BaseSystemFields<Texpand>
export type ItemsResponse<Texpand = unknown> = Required<ItemsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	beats: BeatsRecord
	characters: CharactersRecord
	choices: ChoicesRecord
	gameInstances: GameInstancesRecord
	games: GamesRecord
	itemInstances: ItemInstancesRecord
	items: ItemsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	beats: BeatsResponse
	characters: CharactersResponse
	choices: ChoicesResponse
	gameInstances: GameInstancesResponse
	games: GamesResponse
	itemInstances: ItemInstancesResponse
	items: ItemsResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'beats'): RecordService<BeatsResponse>
	collection(idOrName: 'characters'): RecordService<CharactersResponse>
	collection(idOrName: 'choices'): RecordService<ChoicesResponse>
	collection(idOrName: 'gameInstances'): RecordService<GameInstancesResponse>
	collection(idOrName: 'games'): RecordService<GamesResponse>
	collection(idOrName: 'itemInstances'): RecordService<ItemInstancesResponse>
	collection(idOrName: 'items'): RecordService<ItemsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
