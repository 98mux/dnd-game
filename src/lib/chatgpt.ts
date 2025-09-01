import { OPENAI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';
import { type z } from 'zod';
import { printNode, zodToTs } from 'zod-to-ts';
import { zodFunction } from 'openai/helpers/zod';
import { pbAdmin } from './pocketbase/pocketbaseAdmin.server';
// let model = 'gpt-4-turbo';
let model = 'gpt-4o';
let fastModel = 'gpt-3.5-turbo-1106';
let cheapModel = 'gpt-4o-mini';

let openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : undefined;
export async function chatgpt(prompt: string, text: string) {
	//CHATGPT_KEY doesn't seem to work for some reason on cloud run, can't be bothered to fix it
	if (!openai) {
		return 10;
	}

	const gptResponse = await openai.chat.completions.create({
		messages: [{ role: 'system', content: prompt + text }],
		model: 'gpt-4-1106-preview'
		// model: 'gpt-4'
		// model: 'gpt-4-turbo'
		// model: 'gpt-4'
	});

	const choices = gptResponse.choices;
	const reply = choices[0].message.content;
	return reply;
}

export type Messages = Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
export async function chatgpt2(prompt: string, messages: Messages) {
	if (!openai) {
		return 'openai was undefined somehow';
	}

	const completion = await openai.chat.completions.create({
		messages: [{ role: 'system', content: prompt }, ...messages],
		model: cheapModel
	});
	return completion.choices[0].message.content;
}
export async function gptJSON(
	identifier: string,
	prompt: string,
	typescript: string,
	messages: Messages = []
) {
	if (!openai) {
		return 'openai was undefined somehow';
	}

	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: 'system',
				content:
					prompt +
					'\n the output should  look exactly like this JSON, represented using typescript: ' +
					typescript
			},
			...messages
		],
		model: cheapModel,
		// model: 'gpt-3.5-turbo-1106',
		response_format: { type: 'json_object' }
	});

	let result = JSON.parse(completion.choices[0].message.content);

	await pbAdmin.collection('chatgpt').create({
		identifier,
		input: prompt.length,
		output: JSON.stringify(result).length,
		model: cheapModel
	});
	return result;
}

export async function gptZod(
	identifier: string,
	prompt: string,
	zod: z.Schema,
	fast: boolean = false,
	messages: Messages = [],
	attempts = 3
) {
	if (!openai) {
		return 'openai was undefined somehow';
	}

	const result = await openai.beta.chat.completions.parse({
		messages: [
			{
				role: 'system',
				content: prompt
			},
			...messages
		],
		// model: fast ? fastModel : model,
		model: cheapModel,
		tools: [zodFunction({ name: 'query', parameters: zod })]
	});
	// const content = result.choices[0].message.content;
	// const content2 = result.choices[0].message.content;
	const content3 = result.choices[0].message.tool_calls[0].function.parsed_arguments as string;
	if (!content3) {
		throw new Error('No content received');
	}
	await pbAdmin.collection('chatgpt').create({
		identifier,
		input: prompt.length,
		output: JSON.stringify(result).length,
		// model: fast ? fastModel : model
		model: cheapModel
	});
	return content3;
	// return JSON.parse(content3);
	// return result as z.infer<typeof zod>;
}

export async function gptZodOld(
	identifier: string,
	prompt: string,
	zod: z.Schema,
	fast: boolean = false,
	messages: Messages = [],
	attempts = 3
) {
	if (!openai) {
		return 'openai was undefined somehow';
	}

	const { node } = zodToTs(zod, 'Result');
	const typescript = printNode(node);

	async function attempt() {
		if (!openai) {
			return;
		}
		const result = await openai.chat.completions.create({
			messages: [
				{
					role: 'system',
					content:
						prompt +
						'\n the output should look exactly like this JSON, represented using typescript: ' +
						typescript
				},
				...messages
			],
			// model: fast ? fastModel : model,
			model: cheapModel,
			// model: 'gpt-3.5-turbo-1106',
			response_format: { type: 'json_object' }
			// temperature: 0.9
		});
		const content = result.choices[0].message.content;
		if (!content) {
			throw new Error('No content received');
		}
		return JSON.parse(content);
	}

	let attemptNumber = 0;
	let result = undefined;
	while (attemptNumber < attempts) {
		try {
			result = await attempt();
			zod.parse(result);
			break;
		} catch (error) {
			result = undefined;
		}
		attemptNumber++;
	}
	if (result === undefined) {
		return undefined;
	}
	await pbAdmin.collection('chatgpt').create({
		identifier,
		input: prompt.length,
		output: JSON.stringify(result).length,
		// model: fast ? fastModel : model
		model: cheapModel
	});
	return result as z.infer<typeof zod>;
}

// Function to send a message to the ChatGPT API and get a response
export async function getChatGPTResponse(messageText: string) {
	const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			prompt: messageText,
			max_tokens: 150,
			temperature: 0.7
		})
	});

	if (!response.ok) {
		throw new Error(`Error from OpenAI API: ${response.statusText}`);
	}

	const data = await response.json();
	return data.choices[0].text.trim();
}

//bro
