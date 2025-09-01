<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Text } from '@threlte/extras';
	import * as THREE from 'three';
	let { value = Math.ceil(Math.random() * 20) } = $props();
	let dice: THREE.Group | undefined = $state();
	let spinning = $state(true);
	let velocity = $state({
		x: Math.random() * 8 + 8,
		y: Math.random() * 8 + 8,
		z: Math.random() * 8 + 8
	});
	const geometry = new THREE.IcosahedronGeometry(1);
	const centers: [number, number, number][] = [];
	const lookAts: [number, number, number][] = [];
	const pos = geometry.attributes.position as THREE.BufferAttribute;
	// Some Three.js geometries may be non-indexed; fall back to sequential indices
	const idxArray: ArrayLike<number> = geometry.index
		? geometry.index.array
		: Array.from({ length: pos.count }, (_, i) => i);
	for (let i = 0; i < idxArray.length; i += 3) {
		const a = new THREE.Vector3().fromBufferAttribute(pos, idxArray[i]);
		const b = new THREE.Vector3().fromBufferAttribute(pos, idxArray[i + 1]);
		const c = new THREE.Vector3().fromBufferAttribute(pos, idxArray[i + 2]);
		const centroid = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3).normalize();
		centers.push(centroid.clone().multiplyScalar(1.2).toArray() as [number, number, number]);
		lookAts.push(centroid.clone().multiplyScalar(2).toArray() as [number, number, number]);
	}
	$effect(() => {
		const t = setTimeout(() => (spinning = false), 2000);
		return () => clearTimeout(t);
	});
	useTask((dt) => {
		if (!dice || !spinning) return;
		dice.rotation.x += velocity.x * dt;
		dice.rotation.y += velocity.y * dt;
		dice.rotation.z += velocity.z * dt;
		velocity.x *= 0.96;
		velocity.y *= 0.96;
		velocity.z *= 0.96;
	});
</script>

<T.Group bind:this={dice} castShadow>
	<T.Mesh {geometry} receiveShadow castShadow>
		<T.MeshStandardMaterial color="orange" />
	</T.Mesh>
	{#each centers as center, i}
		<Text
			position={center}
			text={`${i + 1}`}
			fontSize={0.25}
			color="white"
			anchorX="center"
			anchorY="middle"
			lookAt={lookAts[i]}
		/>
	{/each}
</T.Group>
