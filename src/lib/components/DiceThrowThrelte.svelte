<script lang="ts">
	import { Canvas, T, useTask } from '@threlte/core';
	import * as THREE from 'three';
	import Dice from './Dice.svelte';
	import { OrbitControls } from '@threlte/extras';

	let { value = Math.ceil(Math.random() * 20) } = $props();
</script>

<div class="relative w-full h-64 sm:h-80">
	<Canvas class="w-full h-full" dpr={[1, 2]}>
		<T.PerspectiveCamera position={[3, 3, 3]} fov={50} on:create={({ ref }) => ref.lookAt(0, 0, 0)}>
			<OrbitControls enablePan={false} />
		</T.PerspectiveCamera>
		<T.AmbientLight intensity={0.5} />
		<T.DirectionalLight position={[5, 5, 5]} intensity={1} castShadow />
		<T.Mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
			<T.PlaneGeometry args={[10, 10]} />
			<T.MeshStandardMaterial color="#444" />
		</T.Mesh>
		<Dice {value} />
	</Canvas>
</div>
