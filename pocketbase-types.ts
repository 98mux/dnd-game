/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Ok = "ok",
	Test = "test",
	Users = "users",
	ValueOnly = "value_only",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type OkRecord = {
	nice?: string
}

export type TestRecord = {
	value?: string
}

export type UsersRecord = {
	avatar?: string
	name?: string
}

export type ValueOnlyRecord = {
	value?: string
}

// Response types include system fields and match responses from the PocketBase API
export type OkResponse<Texpand = unknown> = Required<OkRecord> & BaseSystemFields<Texpand>
export type TestResponse<Texpand = unknown> = Required<TestRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>
export type ValueOnlyResponse<Texpand = unknown> = Required<ValueOnlyRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	ok: OkRecord
	test: TestRecord
	users: UsersRecord
	value_only: ValueOnlyRecord
}

export type CollectionResponses = {
	ok: OkResponse
	test: TestResponse
	users: UsersResponse
	value_only: ValueOnlyResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'ok'): RecordService<OkResponse>
	collection(idOrName: 'test'): RecordService<TestResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
	collection(idOrName: 'value_only'): RecordService<ValueOnlyResponse>
}
