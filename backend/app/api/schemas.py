from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class FixtureMetadata(BaseModel):
    id: str
    name: str
    category: str
    description: str
    vulnerability_type: str
    speedup_target: float
    original_code: str

class TavilyIntel(BaseModel):
    query: str
    hardware_target: str
    architecture_specs: Dict[str, Any]
    compiler_advisories: List[str]
    citations: List[str]

class RedAttackResult(BaseModel):
    adversarial_harness: str
    tensor_shapes: Dict[str, Any]
    exit_code: int
    crash_signal: Optional[str]
    stack_trace: str
    sdc_detected: bool
    relative_divergence: float

class BluePatchResult(BaseModel):
    kernel_code: str
    boundary_masks: List[str]
    alignment_bytes: int
    num_warps: int
    num_stages: int
    patch_explanation: str

class BenchmarkMetrics(BaseModel):
    baseline_latency_us: float
    hardened_latency_us: float
    speedup: float
    baseline_memory_mb: float
    hardened_memory_mb: float
    memory_reduction_pct: float
    operational_intensity: float
    tflops_achieved: float
    fuzz_passed_count: int
    fuzz_total_count: int
    allclose_validated: bool

class RunExecutionResponse(BaseModel):
    run_id: str
    status: str
    fixture_id: str
    tavily_intel: Optional[TavilyIntel] = None
    red_attack: Optional[RedAttackResult] = None
    blue_patch: Optional[BluePatchResult] = None
    metrics: Optional[BenchmarkMetrics] = None
    attestation_hash: Optional[str] = None
