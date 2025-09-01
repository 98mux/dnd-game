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
	BoardLists = "boardLists",
	Boards = "boards",
	Cards = "cards",
	Links = "links",
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

export type BoardListsRecord = {
	boardId?: RecordIdString
	created?: IsoDateString
	id: string
	order?: number
	title?: string
	updated?: IsoDateString
	userId?: RecordIdString
}

export type BoardsRecord = {
	created?: IsoDateString
	id: string
	order?: number
	title?: string
	updated?: IsoDateString
	userId?: RecordIdString
}

export type CardsRecord = {
	boardId?: RecordIdString
	boardListId?: RecordIdString
	completed?: boolean
	created?: IsoDateString
	id: string
	order?: number
	readyToTest?: boolean
	text?: string
	updated?: IsoDateString
	userId?: RecordIdString
}

export type LinksRecord = {
	created?: IsoDateString
	emoji?: string
	id: string
	link?: string
	name?: string
	order?: number
	updated?: IsoDateString
	userId?: RecordIdString
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
export type BoardListsResponse<Texpand = unknown> = Required<BoardListsRecord> & BaseSystemFields<Texpand>
export type BoardsResponse<Texpand = unknown> = Required<BoardsRecord> & BaseSystemFields<Texpand>
export type CardsResponse<Texpand = unknown> = Required<CardsRecord> & BaseSystemFields<Texpand>
export type LinksResponse<Texpand = unknown> = Required<LinksRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	boardLists: BoardListsRecord
	boards: BoardsRecord
	cards: CardsRecord
	links: LinksRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	boardLists: BoardListsResponse
	boards: BoardsResponse
	cards: CardsResponse
	links: LinksResponse
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
	collection(idOrName: 'boardLists'): RecordService<BoardListsResponse>
	collection(idOrName: 'boards'): RecordService<BoardsResponse>
	collection(idOrName: 'cards'): RecordService<CardsResponse>
	collection(idOrName: 'links'): RecordService<LinksResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
