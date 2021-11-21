import { PerformanceMeasurement } from "../performance/PerformanceMeasurement";

describe("Performance measurement", () => {
	describe("class PerformanceMeasurement", () => {
		const backendIngress = 10000;
		const backendEgress = 20000;
		const operationOrigin = 14000;
		const operationDone = 18000;
		const fullDuration = 20000;
		const measurement = new PerformanceMeasurement(
			backendIngress,
			backendEgress,
			operationOrigin,
			operationDone,
			fullDuration
		);

		const correctRtt = fullDuration - (backendEgress - backendIngress);
		const correctLatency = correctRtt / 2;
		const correctBackendDuration = operationOrigin - backendIngress;
		const correctOperationDuration = operationDone - operationOrigin;
		const correctResponseDuration = backendEgress - operationDone;
		it("should compute the correct rtt", () => {
			expect(measurement.computeRtt()).toEqual(correctRtt);
		});

		it("should compute the correct latency", () => {
			expect(measurement.computeLatency()).toEqual(correctLatency);
		});

		it("should compute the correct request backend duration", () => {
			expect(measurement.computeBackendOperationDuration()).toEqual(
				correctBackendDuration
			);
		});

		it("should compute the correct operation duration", () => {
			expect(measurement.computeBackendOperationDuration()).toEqual(
				correctOperationDuration
			);
		});

		it("should compute the correct response backend duration", () => {
			expect(measurement.computeBackendResponseDuration()).toEqual(
				correctResponseDuration
			);
		});
	});
});
