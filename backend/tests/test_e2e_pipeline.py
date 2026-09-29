import pytest
from app.core.recon import tavily_oracle
from app.core.red_agent import red_agent
from app.core.blue_agent import blue_agent
from app.core.verifier import verifier
from app.core.orchestrator import orchestrator

@pytest.mark.asyncio
async def test_tavily_oracle():
    specs = await tavily_oracle.get_hardware_and_compiler_specs("swiglu", "NVIDIA Hopper H100 SXM5")
    assert "architecture_specs" in specs
    assert specs["architecture_specs"]["warp_size"] == 32
    assert specs["architecture_specs"]["shared_memory_per_sm_kb"] == 228
    assert len(specs["compiler_advisories"]) > 0

def test_red_agent_attack():
    attack = red_agent.synthesize_attack("swiglu")
    assert attack.exit_code == 139
    assert attack.sdc_detected is True
    assert "batch_size" in attack.tensor_shapes

def test_blue_agent_patch():
    patch = blue_agent.synthesize_patch("swiglu", "NVIDIA Hopper H100 SXM5")
    assert "@triton.jit" in patch.kernel_code
    assert len(patch.boundary_masks) > 0
    assert patch.num_warps == 8

def test_verifier_benchmarks():
    metrics = verifier.calculate_benchmarks("swiglu", "NVIDIA Hopper H100 SXM5")
    assert metrics.speedup > 1.5
    assert metrics.allclose_validated is True
    assert metrics.fuzz_passed_count == 500

def test_generate_github_pr():
    pr = orchestrator.generate_github_pr("swiglu", "NVIDIA Hopper H100 SXM5")
    assert "Aegis-Kernel Autonomous Pull Request" in pr["body"]
    assert "tl.load" in pr["patch_code"]
    assert pr["branch"] == "aegis/harden-swiglu"
