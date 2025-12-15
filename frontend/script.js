/**
 * DevOps Interview Questions & Answers SPA
 * Pure static implementation (no backend) suitable for GitHub Pages.
 * Provides:
 *  - Sidebar topic navigation
 *  - Dynamic question rendering per topic
 *  - Search filtering within current topic
 *  - Persistent last-opened topic via localStorage
 *  - Accessible markup & keyboard navigation
 */

// ---------------------- Data Source ----------------------
// Each topic has an array of Q&A objects: { q: string, a: string }
// Minimum 10 items per topic (can be extended easily).
const devOpsData = {
    "Linux": [
        { q: "How do you diagnose and resolve production memory leaks on systems with millions of requests/day?", a: "Use valgrind, heaptrack, or /proc/<pid>/smaps for detailed analysis. Monitor RSS vs VSZ trends. Use memory profilers in code. Implement periodic restarts as temporary fix. Check for long-lived caches. Use jemalloc for C/C++ apps. Implement memory limits and monitoring with cgroups/systemd limits." },
        { q: "Optimize kernel parameters for high-throughput, low-latency networking (millions of concurrent connections).", a: "Increase net.core.somaxconn, net.ipv4.tcp_max_syn_backlog, net.core.netdev_max_backlog. Set net.ipv4.tcp_tw_reuse=1. Tune TCP buffer sizes (net.ipv4.tcp_rmem, net.ipv4.tcp_wmem). Disable TCP timestamps if needed. Use SO_REUSEADDR. Increase /proc/sys/fs/file-max for file descriptors. Monitor with 'ss' for connection states." },
        { q: "How to handle filesystem performance degradation during peak load?", a: "Monitor inode usage (df -i). Check I/O wait (iostat -x). Use fio for benchmarking. Implement journal batching. Consider ext4 vs XFS based on workload. Monitor dirty page ratio. Use tmpfs for temporary data. Implement write coalescing. Check disk queue depth and latency." },
        { q: "Troubleshoot production CPU contention and context switching storms.", a: "Use 'top', 'vmstat', 'mpstat' to identify hotspots. Check context switch rates (higher than cpu_count suggests contention). Profile with perf: 'perf record -a sleep 10; perf report'. Use systemtap for kernel tracing. Implement CPU affinity for important processes. Tune CPU scheduling (CFS parameters)." },
        { q: "Design kernel parameter strategy for containerized workloads at scale.", a: "Set vm.overcommit_memory=1 for Kubernetes. Configure memory limits via cgroups. Tune swappiness (vm.swappiness=10 for cloud). Implement net.ipv4.ip_local_reserved_ports to avoid ephemeral port exhaustion. Set fs.file-max appropriately. Use sysctl to persist changes. Document all tunings with justification for compliance." },
        { q: "How to perform live kernel patching without downtime?", a: "Use kpatch or livepatch for critical security patches. Pre-test patches on staging. Implement graceful application reload before applying. Monitor system stability post-patch. Have rollback plan. Use automated patch management (Canonical Livepatch, Azure). Combine with container restarts for defense-in-depth." },
        { q: "Implement comprehensive system audit logging for security compliance (SOC 2, ISO 27001).", a: "Use auditd with comprehensive rules for system calls, file access, privilege changes. Ship logs to centralized SIEM (ELK, Splunk). Implement log retention (typically 90-365 days). Monitor root/sudo access. Track file integrity (aide, tripwire). Implement log integrity checks. Disable core dump capabilities. Monitor for tampering attempts." },
        { q: "Troubleshoot production TCP connection timeouts and half-open connections.", a: "Check tcp_keepalive_time, tcp_keepalive_intvl, tcp_keepalive_probes settings. Monitor SYN flood with 'ss -tan | grep SYN'. Check firewall rules (iptables/nftables). Verify application-level keep-alives. Monitor netstat for TIME_WAIT connections. Implement tcp_tw_reuse for rapid reconnection. Check firewall state tracking limits." },
        { q: "Design disaster recovery strategy for critical Linux systems with RPO/RTO targets.", a: "Implement regular snapshots (LVM, btrfs, or cloud-native). Use remote replication (rsync, Bacula, Veeam). Practice restore drills monthly. Document recovery procedures. Maintain disk images for critical systems. Implement database-specific backups (MySQL, PostgreSQL) with PITR. Use infrastructure-as-code for rapid provisioning." },
        { q: "Optimize systemd service startup during boot for 1000+ services.", a: "Use Type=notify or Type=simple appropriately. Implement socket activation for parallelization. Reduce service startup timeout. Use systemd.automount for lazy mounting. Monitor startup dependencies with 'systemd-analyze critical-chain'. Implement health checks instead of arbitrary delays. Use tmpfiles.d for ephemeral file setup." },
        { q: "How to prevent and mitigate privilege escalation attacks in production?", a: "Disable unnecessary SUID binaries. Use AppArmor/SELinux policies strictly. Implement sudo with time-based 2FA (DUO, Google Authenticator). Monitor for setuid/setgid abuse. Use capabilities instead of SUID where possible. Implement kernel module signing. Use measured boot (TPM, SecureBoot). Regular vulnerability scanning for privilege escalation CVEs." },
        { q: "Implement effective log rotation strategy for 100GB+ daily logs.", a: "Use logrotate with dateext format. Compress immediately post-rotation (gzip). Ship to centralized logging (syslog, fluentd). Implement log sampling for high-volume apps. Delete after retention period (compliance). Monitor disk usage. Implement log buffering. Use async I/O for log writes. Consider structured logging (JSON) for searchability." },
        { q: "Troubleshoot page cache efficiency and implement appropriate caching strategies.", a: "Monitor page cache hits with /proc/vmstat (pgpgin, pgpgout). Use 'cachestat' tool. Implement drop_caches carefully for testing. Use memory-mapped I/O for frequently accessed files. Monitor buffer/cache ratio with 'free'. Implement application-level caching (Redis). Consider read-ahead tuning for sequential workloads." },
        { q: "Design network bandwidth management for multi-tenant Linux systems.", a: "Use tc (traffic control) with HTB (Hierarchical Token Bucket) for QoS. Implement per-application rate limits with cgroups v2. Monitor with 'ifstat', 'nethogs'. Use BPF-based monitoring for detailed analysis. Implement ingress/egress policies. Fair queue scheduling with fq_codel. Document SLA expectations and enforce via policy." },
        { q: "Implement effective process resource limits (cgroups) for container-like isolation.", a: "Use cgroups v2 for unified hierarchy. Set memory.max, cpu.max, io.max limits. Implement reservation (memory.min) for QoS. Monitor with 'systemd-cgtop'. Use oom.group to notify on group OOM. Implement cpuset for CPU pinning on NUMA. Test limits with stress-ng. Document limits with business justification." },
        { q: "Troubleshoot and optimize DNS resolution latency in production.", a: "Monitor /etc/resolv.conf configuration. Check nameserver response times with 'dig +stats'. Implement local caching resolver (systemd-resolved, dnsmasq). Monitor DNS query logs. Implement retry logic for timeouts. Consider split-horizon DNS. Monitor for DNS amplification attacks. Validate DNSSEC where applicable." },
        { q: "Design comprehensive monitoring strategy for kernel OOM behavior and prevention.", a: "Configure vm.panic_on_oom=0 for graceful handling. Implement memory.pressure_level for early warnings. Use PSI metrics (Pressure Stall Information). Monitor /proc/pressure for system-wide pressure. Implement OOMkiller tuning (oom_adj, memory.oom_control). Alert on memory pressure before OOM. Implement PID-specific memory limits. Document OOM-safe shutdown procedures." },
        { q: "Implement secure secrets storage for system-level credentials and certificates.", a: "Use TPM for key storage where available. Implement HashiCorp Vault for credential management. Use systemd user credentials for service secrets. Encrypt /etc filesystem where possible. Use LUKS for full-disk encryption. Implement certificate rotation automation. Store secrets in tmpfs where appropriate. Use file permissions (0600) strictly. Never log secrets or put in configs." },
        { q: "Troubleshoot production system clock skew and implement NTP/PTP synchronization.", a: "Monitor clock with 'timedatectl' or 'ntpq'. Implement PTP (Precision Time Protocol) for < 1us accuracy. Use ntpsec or chrony (more reliable than legacy ntpd). Monitor clock drift continuously. Alert on skew > threshold. Implement hardware clock backup. Use GPS receivers for critical systems. Document clock requirements by application." },
        { q: "Design and implement effective IPC (Inter-Process Communication) strategies for performance.", a: "Choose between pipes, sockets, shared memory, message queues based on throughput/latency needs. Implement lock-free structures with atomic operations. Use epoll/kqueue for efficient multiplexing. Monitor IPC overhead with perf. Implement backpressure handling. Use memory barriers appropriately. Benchmark alternatives (unix sockets vs TCP, mmap vs pipes)." }
    ],
    "Git": [
        { q: "Explain git fetch vs git pull.", a: "fetch downloads remote refs only; pull = fetch + merge (or rebase if configured)." },
        { q: "What is a detached HEAD?", a: "You checked out a commit (not a branch). HEAD points directly to commit. Create a branch to retain work." },
        { q: "How to undo last commit but keep changes staged?", a: "git reset --soft HEAD~1." },
        { q: "Purpose of .gitignore?", a: "Lists patterns for files Git shouldn't track. Already tracked files need git rm --cached." },
        { q: "Difference between rebase and merge?", a: "Merge preserves history (adds merge commit). Rebase rewrites commits onto new base for linear history." },
        { q: "Explain fast-forward merge.", a: "Branch pointer moves forward because target has no divergent commits; no merge commit created." },
        { q: "How to squash commits?", a: "Interactive rebase: git rebase -i HEAD~N then mark commits as squash/fixup." },
        { q: "What are Git hooks?", a: "Scripts executed at certain events (pre-commit, pre-push, etc.) found in .git/hooks." },
        { q: "Difference between git stash and git commit?", a: "stash saves WIP changes (uncommitted) aside; commit records snapshot in history." },
        { q: "How to recover deleted branch?", a: "Find commit via git reflog then recreate: git branch branchName <commit>." },
        { q: "What is git reflog?", a: "Local history of HEAD movements allowing recovery of lost commits/branches." },
        { q: "Difference between annotated and lightweight tag?", a: "Annotated stores metadata (message, tagger, GPG); lightweight is just a pointer." },
        { q: "Purpose of git bisect?", a: "Binary search through commits to locate introduction of a bug using good/bad markers." },
        { q: "How to apply a single commit from another branch?", a: "Use git cherry-pick <commit_sha>." },
        { q: "Submodule vs subtree?", a: "Submodule links external repo at specific commit; subtree copies repo content allowing easier integration." },
        { q: "What is a shallow clone?", a: "Clone with limited history depth (git clone --depth=N) to reduce transfer size." },
        { q: "Difference between HEAD, index, working tree?", a: "HEAD points to last commit; index (staging area) tracks next commit content; working tree is checked-out files." },
        { q: "How to amend last commit?", a: "git commit --amend (updates commit message or staged changes)." },
        { q: "Cleaning untracked files safely?", a: "Use git clean -n for preview then git clean -fd to remove." },
        { q: "Branch rename procedure?", a: "git branch -m old new; push new and delete remote old: git push origin :old new; update default if needed." },
        { q: "Purpose of git worktree?", a: "Allows multiple checkout working directories of same repo for parallel feature work." },
        { q: "What is a merge conflict?", a: "Overlapping edits in same lines between branches requiring manual resolution." },
        { q: "How to list commits not merged into main?", a: "git log main..feature or git cherry -v main feature." },
        { q: "git revert vs reset?", a: "revert creates inverse commit preserving history; reset moves branch pointer (can rewrite history)." },
        { q: "When to use rebase --interactive?", a: "For cleaning commit history (squash, reorder, edit messages) before sharing." },
        { q: "How to sign commits?", a: "Configure GPG or SSH signing then use git commit -S; verify with git log --show-signature." }
    ],
    "GitHub": [
        { q: "What is a GitHub Action workflow?", a: "Automated CI/CD pipeline defined as YAML in .github/workflows triggered by events (push, PR, schedule)." },
        { q: "Difference between public and private repo?", a: "Public visible to all. Private restricted to collaborators & org policies." },
        { q: "What are protected branches?", a: "Branch rules enforcing reviews, status checks, signed commits before merging." },
        { q: "How does CODEOWNERS work?", a: "Maps file patterns to owners who must review PRs touching those paths." },
        { q: "GitHub Actions caching use-case?", a: "Speeds builds by storing dependency layers or artifacts between workflow runs." },
        { q: "Explain GitHub Environments.", a: "Define deployment targets with reviewers, secrets, wait timers, for release gating." },
        { q: "What are GitHub Pages?", a: "Static site hosting directly from repository (branch or /docs folder)." },
        { q: "How to trigger workflow manually?", a: "Add workflow_dispatch event and use 'Run workflow' in Actions tab or REST API." },
        { q: "Difference between Marketplace action and composite action?", a: "Marketplace actions published separately; composite action aggregates steps in repo maintaining portability." },
        { q: "How to store secrets?", a: "Repository or organization settings > Secrets (encrypted), consumed in workflows via secrets.NAME." },
        { q: "Purpose of Actions matrix strategy?", a: "Run job across multiple versions/OS/toolchains for broad compatibility testing." },
        { q: "Self-hosted runner security consideration?", a: "Potential privilege escalation; restrict repository access, use ephemeral runners." },
        { q: "What is required status check?", a: "Setting that blocks merging until specified workflow(s)/contexts succeed." },
        { q: "Difference between issue and discussion?", a: "Issues track tasks/bugs; Discussions enable threaded community Q&A and ideation." },
        { q: "Dependabot purpose?", a: "Automates dependency update PRs and security alerts for vulnerable packages." },
        { q: "How to optimize large monorepo CI?", a: "Use path filters, matrix exclude/include, artifact caching, partial builds." },
        { q: "Fork vs branch collaboration?", a: "Forks isolate contributions (open source); branches inside same repo easier for internal teams." },
        { q: "How to enforce commit signing?", a: "Enable required signed commits in repository settings; verify GPG/SSH signatures." },
        { q: "What is semantic version tagging practice?", a: "Use annotated tags vMAJOR.MINOR.PATCH to indicate release changes following semver rules." },
        { q: "Release vs tag difference?", a: "Release wraps a tag with metadata, notes, assets for distribution." },
        { q: "Workflow concurrency control?", a: "Use concurrency group + cancel-in-progress to avoid overlapping deployments." },
        { q: "Re-run failed jobs strategy?", a: "Use 'Re-run jobs' or targeted debug logging with workflow_dispatch and same ref." },
        { q: "Actions artifact retention?", a: "By default 90 days (configurable); large artifacts increase storage costs." },
        { q: "How to share reusable workflows?", a: "Define in .github/workflows with workflow_call trigger; other repos reference with ref." },
        { q: "Secret scanning alerts?", a: "Automatically detect known patterns (tokens) and notify to remediate exposures." },
        { q: "Fine-grained personal access tokens?", a: "Scoped tokens with narrower permissions improving security over classic PATs." },
        { q: "GitHub Pages custom domain setup?", a: "Add CNAME in repo + configure DNS records pointing to GitHub pages endpoints." },
        { q: "Actions job outputs usage?", a: "Set via echo 'name=value' >> $GITHUB_OUTPUT then consumed across dependent jobs." },
        { q: "Handling workflow secrets in PRs from forks?", a: "Secrets not exposed by default; use pull_request_target with caution (security review)." },
        { q: "How to reduce Actions bill?", a: "Cache dependencies, cancel obsolete builds, optimize matrix size, use self-hosted for heavy tasks." },
        { q: "GitHub audit log purpose?", a: "Tracks security-relevant organization/repo events for compliance & forensics." },
        { q: "Advantages of GitHub Projects (beta)?", a: "Flexible boards filtered by queries integrating issues, PRs, custom fields." }
    ],
    "Jenkins": [
        { q: "What is a Jenkins pipeline?", a: "Declarative or scripted logic describing CI/CD stages, steps, environment, agents." },
        { q: "Difference between freestyle and pipeline job?", a: "Freestyle UI configured; pipeline-as-code (Jenkinsfile) versioned, more flexible." },
        { q: "How to share pipeline code?", a: "Use shared libraries (vars/, src/) referenced via @Library annotation." },
        { q: "Purpose of agent directive?", a: "Defines where pipeline runs (any, docker, label, none)." },
        { q: "Blue Ocean?", a: "Modern visualization UI for pipelines with improved UX." },
        { q: "Retry failing stage?", a: "Use retry(n) { steps } in scripted or options { retry(n) } declarative." },
        { q: "Credentials binding pattern?", a: "withCredentials([string(...)]) { ... } or environment { VAR = credentials('id') }." },
        { q: "Parallel stage usage?", a: "Run independent tasks simultaneously to speed build (tests, lint)." },
        { q: "Jenkins master vs agent?", a: "Controller orchestrates builds; agents execute jobs on various nodes." },
        { q: "How to prevent secret echoing?", a: "Mask with credentials plugin; avoid echoing; use withCredentials; enable 'Prevent Cross Site' config." },
        { q: "Declarative vs scripted pipeline?", a: "Declarative simpler structured syntax; scripted full Groovy flexibility for complex logic." },
        { q: "How to archive artifacts?", a: "Use archiveArtifacts patterns: 'build/*.jar' then access via Jenkins UI or downstream jobs." },
        { q: "Use of when conditions?", a: "Control stage execution based on branch, environment, expression, changeset." },
        { q: "Shared library version pinning?", a: "Reference specific tag/branch in @Library('lib@v1') to ensure reproducible builds." },
        { q: "Declarative post section purpose?", a: "Defines actions run on pipeline completion states (success, failure, always, unstable)." },
        { q: "What is Jenkinsfile checkout scm?", a: "Built-in step to re-checkout source enabling subsequent operations on workspace." },
        { q: "Pipeline input step use-case?", a: "Pauses execution awaiting human approval before proceeding (e.g., prod deploy)." },
        { q: "Jenkins queue throttling?", a: "Limit concurrent builds per category using Throttle Concurrent Builds plugin." },
        { q: "Credentials types examples?", a: "Username/Password, Secret Text, SSH key, Certificate, AWS credentials." },
        { q: "Node label usage?", a: "Tag agents with capabilities; pipeline agent { label 'docker' } schedules builds accordingly." },
        { q: "Workspace cleanup strategy?", a: "Use cleanWs() after builds or enable discard builds and artifact retention policies." },
        { q: "Pipeline libraries testing?", a: "Write unit tests using JenkinsPipelineUnit framework mocking steps." },
        { q: "Scaling Jenkins controllers?", a: "Use ephemeral agents, split workloads across controllers, externalize state (e.g., DB)." },
        { q: "Security hardening steps?", a: "Restrict script security, update plugins, enforce matrix auth, disable CLI if unused." },
        { q: "Jenkins backup components?", a: "Jobs, plugins, credentials, secrets, Jenkins home; use periodic snapshots and configuration as code." },
        { q: "What is Configuration as Code plugin?", a: "Allows YAML definition for Jenkins system configuration enabling reproducible instances." },
        { q: "How to handle flaky tests?", a: "Use retry wrapper, isolate environment, quarantine tag, gather diagnostics automatically." },
        { q: "Declarative agent none meaning?", a: "Allows top-level stages to specify their own agent blocks rather than shared global agent." },
        { q: "Blue/green Jenkins upgrade approach?", a: "Spin up new controller version, import config, run validations, switch traffic, keep old for fallback." }
    ],
    "Docker": [
        { q: "Design a secure container image supply chain for production deployments.", a: "Implement image signing (Docker Content Trust), vulnerability scanning (Trivy, Grype) in CI/CD, registry scanning, namespace isolation in registry, immutable image tags, minimal base images, no root user, scan on push/pull, maintain audit logs of all image operations." },
        { q: "Optimize Docker image sizes and layer caching for millions of daily builds.", a: "Use multi-stage builds, distroless/alpine base images (20-100MB vs 500MB+). Order Dockerfile for maximal caching. Consolidate RUN commands. Use .dockerignore aggressively. Compress artifacts. Implement layer deduplication in registry. Monitor image sizes in CI. Set max image size policies." },
        { q: "Implement container runtime security at scale (seccomp, AppArmor, capabilities).", a: "Drop unnecessary capabilities (CAP_NET_RAW, CAP_SYS_ADMIN). Implement seccomp profiles blocking dangerous syscalls. Use AppArmor/SELinux policies. Run as non-root. Use read-only rootfs where possible. Implement pod security policies in Kubernetes. Regular security audits of policies." },
        { q: "Handle secrets securely in Docker without embedding in images.", a: "Never use ENV or ARG for secrets. Use Docker secrets (Swarm) or Kubernetes Secrets. Use external secret management (HashiCorp Vault, AWS Secrets Manager). Implement secret rotation. Use tmpfs for temporary secrets. Audit all secret access. Use encryption at rest for secrets. Implement least-privilege access." },
        { q: "Troubleshoot container network connectivity issues in production.", a: "Inspect network configuration with 'docker network inspect'. Check port bindings (docker port). Verify DNS resolution (docker exec -it <id> nslookup). Monitor with docker stats. Check firewall rules on host. Verify exposed vs published ports. Use tcpdump on host network. Implement health checks." },
        { q: "Design multi-host container networking strategy (overlay networks, service discovery).", a: "Use overlay networks for cross-host communication. Implement DNS service discovery (built-in in Docker/K8s). Use load balancing for service endpoints. Configure network policies. Monitor network latency. Implement network segmentation. Use service mesh for advanced routing. Document network topology." },
        { q: "Optimize Docker resource limits and implement fair resource sharing.", a: "Set memory limits (--memory) to prevent OOM-kills. Implement CPU limits (--cpus) based on workload. Use memory reservations for guaranteed capacity. Implement swap limits. Monitor with docker stats, cgroup metrics. Implement resource requests/limits per container. Implement CPU affinity for latency-sensitive workloads." },
        { q: "Implement comprehensive logging strategy for container environments (ELK, Loki).", a: "Configure log driver (json-file, awslogs, splunk). Implement log rotation to prevent disk fill. Ship logs to centralized system. Use structured logging (JSON). Tag logs with container metadata. Implement log filtering and sampling. Monitor logs for security events. Implement audit logging for sensitive operations." },
        { q: "Design disaster recovery for containerized applications with persistent data.", a: "Implement volume backups (snapshots, replication). Use database-specific backup tools. Implement automated backup testing. Document RTO/RPO by application. Use geographically distributed backups. Implement point-in-time recovery. Regular restore drills. Version control infrastructure-as-code. Implement immutable backups." },
        { q: "Troubleshoot performance degradation in container workloads.", a: "Monitor CPU, memory, I/O, network metrics. Profile with perf, systemtap. Check for memory leaks. Verify resource limits aren't causing throttling. Monitor disk I/O patterns. Check for network saturation. Profile application code. Implement APM (Datadog, New Relic). Benchmark baseline performance." },
        { q: "Implement registry security and compliance (private registry, RBAC, scanning).", a: "Use private registries (Harbor, Artifactory, ECR). Implement RBAC for registry access. Enable image scanning on push/pull. Enforce image signing. Implement retention policies. Audit registry operations. Use harbor for vulnerability scanning and compliance. Implement network policies around registry access." },
        { q: "Design image promotion workflow across environments (dev→staging→prod).", a: "Tag images with environment info. Implement promotion via CI/CD pipeline. Require approvals for prod promotions. Implement smoke tests post-promotion. Monitor for regressions. Use GitOps for declarative promotion. Implement image scanning at each stage. Maintain audit trail of promotions." },
        { q: "Handle container startup order and dependencies (init containers, wait scripts).", a: "Implement dependency checks in startup scripts. Use init containers to prepare environment. Implement health checks with retries. Use orchestrator dependencies (depends_on in compose). Implement exponential backoff for retries. Document startup dependencies. Use configuration management for dependency injection." },
        { q: "Implement cost optimization strategies for Docker infrastructure.", a: "Monitor image disk usage. Implement image cleanup policies. Use smaller base images. Consolidate services where possible. Implement resource right-sizing. Use spot/preemptible instances in cloud. Monitor registry storage costs. Implement image deduplication. Regular cost audits." },
        { q: "Implement container update and patching strategy for base images.", a: "Scan regularly for base image vulnerabilities. Implement automated rebuilds of dependent images. Use Dependabot/Renovate for updates. Test updates in non-prod first. Implement rolling updates with health checks. Document patch procedures. Maintain patch SLA. Implement automated patch compliance checking." },
        { q: "Design strategy for managing container configuration across environments.", a: "Use environment-specific configuration files (12-factor). Implement ConfigMaps/Secrets for different environments. Use templating tools (Kustomize, Helm). Validate configuration in CI/CD. Implement configuration drift detection. Use infrastructure-as-code for consistency. Document configuration requirements by application." },
        { q: "Troubleshoot Docker daemon issues and implement high-availability setup.", a: "Monitor daemon health. Check daemon logs for errors. Implement daemon restart policies. Use systemd service for daemon management. Configure daemon storage driver appropriately. Monitor disk usage for daemon. Implement redundant docker engines. Configure daemon reload policies safely." },
        { q: "Implement container orchestration migration strategy (Docker Swarm vs Kubernetes).", a: "Evaluate requirements (scale, features, complexity). Plan phased migration. Test workloads on target platform. Implement networking translation. Plan storage migration. Document runbook changes. Train operations team. Implement monitoring on new platform. Gradual cutover with rollback plan." },
        { q: "Design build optimization for large monorepos with hundreds of services.", a: "Implement Docker layer caching across builds. Use build cache storage (registry, S3). Implement conditional builds (only affected services). Use parallel builds. Implement build matrix strategies. Monitor build times. Implement build timeout policies. Cache dependencies separately from code." },
        { q: "Implement security scanning in CI/CD pipeline as enforcement gate.", a: "Run image scans before push. Fail builds on critical CVEs. Implement policy-as-code (OPA). Scan dependencies (SBOM). Check image signatures. Enforce minimal base images. Block containers from untrusted registries. Regular re-scanning of deployed images. Integration with security incident response." }
    ],
    "Docker Commands": [
        { q: "What is docker run?", a: "Launches a new container from an image with specified config (ports, volumes, env, etc)." },
        { q: "How to build an image?", a: "docker build -t <tag> <dockerfile_path>; creates image layers from Dockerfile instructions." },
        { q: "What is docker pull?", a: "Downloads image from registry (default Docker Hub) to local machine." },
        { q: "How to push image to registry?", a: "Tag with registry: docker tag <image> <registry>/<image>; then docker push <registry>/<image>." },
        { q: "docker exec command use?", a: "Runs command inside running container without attaching STDIN/STDOUT unless -it flags used." },
        { q: "What does docker ps show?", a: "Lists running containers; docker ps -a includes stopped; shows ID, image, command, status, ports." },
        { q: "How to view image layers?", a: "docker history <image> or docker inspect <image> showing each layer size and creation timestamp." },
        { q: "What is docker inspect?", a: "Returns detailed JSON config of container/image including mounts, networks, env, resource limits." },
        { q: "How to remove image?", a: "docker rmi <image>; force with -f; only if not referenced by containers." },
        { q: "What is docker logs?", a: "Streams stdout/stderr of running/stopped container; use -f follow, --tail N recent lines." },
        { q: "How to list all images?", a: "docker images shows repositories, tags, IDs, sizes; docker image ls similar." },
        { q: "What is docker network?", a: "Manages container networks (bridge, host, overlay); docker network ls, create, inspect, connect, disconnect." },
        { q: "How to create named volume?", a: "docker volume create <name>; mount with -v <name>:<container_path> or --mount type=volume." },
        { q: "docker cp command purpose?", a: "Copies files/directories between host and container: docker cp <src> <dest>." },
        { q: "How to restart container?", a: "docker restart <container> sends SIGTERM then starts; docker start for stopped, docker stop for running." },
        { q: "What is docker compose up?", a: "Creates and starts services defined in docker-compose.yml; -d detached, --build rebuilds images." },
        { q: "How to scale service in Compose?", a: "docker-compose up -d --scale <service>=<count> (legacy); v3+ use deploy.replicas in yaml." },
        { q: "docker pause vs docker stop?", a: "pause suspends processes with SIGSTOP; stop terminates with SIGTERM+SIGKILL (graceful)." },
        { q: "What is docker commit?", a: "Creates image from modified container: docker commit <container> <repo:tag> (anti-pattern, use Dockerfile)." },
        { q: "How to tag image?", a: "docker tag <source_image> <target_repo:tag>; enables versioning and multi-registry pushes." },
        { q: "What is docker save/load?", a: "save exports image to tar: docker save -o file.tar <image>; load imports from tar." },
        { q: "How to clean up unused resources?", a: "docker system prune removes stopped containers, dangling images, unused networks/volumes." },
        { q: "What does docker stats show?", a: "Real-time CPU, memory, network, block I/O stats for running containers." },
        { q: "How to set resource limits?", a: "--memory N, --cpus N, --memory-swap in docker run; limits container resource consumption." },
        { q: "What is docker swarm?", a: "Built-in clustering mode enabling multi-host orchestration and services without external tools." },
        { q: "docker init purpose?", a: "Generates Dockerfile, docker-compose.yml, .dockerignore for project scaffolding (Docker Desktop)." },
        { q: "How to run containers in foreground?", a: "docker run (without -d flag) attaches STDIN/STDOUT/STDERR; Ctrl+C stops container." },
        { q: "What is docker attach?", a: "Connects to running container stdin/stdout/stderr; docker logs better for reading history without interrupting." },
        { q: "How to set environment variables?", a: "-e KEY=value in docker run; or env section in docker-compose.yml; ENV in Dockerfile." },
        { q: "What is docker manifest?", a: "Lists image references and digests; docker manifest inspect shows platform-specific images in manifest list." }
    ],
    "Kubernetes": [
        { q: "Design multi-cluster Kubernetes federation strategy with failover and load balancing.", a: "Use KubeFed or service mesh for federation. Implement cross-cluster load balancing (AWS GLB, Istio). Replicate applications across clusters. Implement health checks per cluster. Automatic failover on cluster failure. Synchronize ConfigMaps/Secrets across clusters. Centralized monitoring/logging across clusters. Document recovery procedures by cluster." },
        { q: "Implement Kubernetes security best practices (RBAC, Pod Security, Network Policies).", a: "Use RBAC with least privilege service accounts. Implement Pod Security Standards (restrict privileged mode). Enforce Network Policies blocking cross-namespace by default. Use OPA/Kyverno for policy enforcement. Implement image registry whitelisting. Scan images for vulnerabilities. Use pod security admission controller. Regular RBAC audits." },
        { q: "Design stateful application deployment strategy in Kubernetes (databases, caches).", a: "Use StatefulSets for stable identity. Implement persistent volume claims with appropriate storage classes. Use topology-aware scheduling (affinity rules). Implement backup strategy for persistent data. Use init containers for setup. Implement health checks with appropriate timeouts. Use headless services for direct pod access. Test failover scenarios." },
        { q: "Optimize Kubernetes cost while maintaining reliability and performance.", a: "Right-size resource requests/limits based on actual usage. Use spot/preemptible VMs with pod disruption budgets. Implement cluster autoscaler with Karpenter for efficiency. Use node affinity to consolidate workloads. Implement resource quotas per namespace. Monitor with Kubecost. Use serverless for variable workloads. Implement chargeback models." },
        { q: "Implement Service Mesh (Istio) for traffic management, security, observability.", a: "Deploy Istio with sidecar injection. Implement VirtualServices for traffic routing. Use DestinationRules for load balancing. Implement circuit breakers. Implement request routing based on headers/paths. Collect distributed traces (Jaeger). Implement mTLS for service-to-service communication. Monitor with Kiali. Implement rate limiting and retries." },
        { q: "Design strategy for managing Kubernetes secrets at scale with rotation and auditing.", a: "Use external secret management (Vault, cloud provider solutions). Implement secret rotation automation. Use Sealed Secrets or External Secrets Operator. Never log secrets. Implement RBAC for secret access. Audit all secret access. Use encryption at rest. Implement secret scanning in CI/CD. Regular secret audit reviews." },
        { q: "Handle persistent storage in Kubernetes with snapshots, replication, backups.", a: "Use appropriate storage classes (local, EBS, NFS, CSI). Implement snapshot-based backups. Use storage replication for HA. Implement automated backup testing. Document RTO/RPO by application. Use volume snapshots for point-in-time recovery. Implement cross-zone replication. Monitor storage capacity." },
        { q: "Implement zero-downtime Kubernetes cluster upgrades with etcd migration.", a: "Plan upgrade window with minimal business impact. Drain nodes gracefully using PodDisruptionBudgets. Upgrade control plane components sequentially. Test on staging cluster first. Upgrade kubelet on worker nodes. Validate cluster health post-upgrade. Monitor for regressions. Have rollback plan. Document compatibility matrix." },
        { q: "Design Kubernetes networking for multi-team environments with isolation and performance.", a: "Use Network Policies for traffic segmentation. Implement Calico/Cilium for advanced networking. Use separate subnets for different teams. Implement egress filtering. Use service mesh for routing. Monitor network latency. Implement network policies as code. Document network architecture. Test network failover scenarios." },
        { q: "Implement comprehensive Kubernetes monitoring, logging, alerting (Prometheus, ELK, Alertmanager).", a: "Deploy Prometheus for metrics collection. Use Grafana for visualization. Implement centralized logging (ELK, Loki). Collect application and system metrics. Implement SLO-based alerting. Use AlertManager for intelligent alert routing. Implement custom metrics for business logic. Use distributed tracing (Jaeger). Regular alert review and tuning." },
        { q: "Handle Kubernetes resource contention and implement fair scheduling (QoS, Priority Classes).", a: "Implement Requests/Limits for QoS. Use PriorityClasses for workload importance. Implement Pod Disruption Budgets. Monitor resource utilization. Implement Vertical Pod Autoscaling. Use node affinity for workload placement. Implement preemption policies. Monitor for starvation. Document QoS policies per workload." },
        { q: "Design disaster recovery for Kubernetes clusters with backup/restore procedures.", a: "Backup etcd regularly (tested restore procedure). Back up persistent data separately. Use Infrastructure-as-Code for cluster recreation. Implement geographically distributed backups. Test restore procedures monthly. Document RTO/RPO. Implement immutable backups. Use separate backup storage accounts. Encrypt backups." },
        { q: "Implement GitOps for Kubernetes with declarative infrastructure and automated reconciliation.", a: "Use Flux or ArgoCD for Git-to-cluster sync. Separate infra/apps repos. Use Kustomize/Helm for templating. Implement image update automation (Renovate). Track all changes in Git. Implement approval gates for manual changes. Monitor reconciliation status. Use pull request workflows for changes. Implement secrets management with sealed secrets." },
        { q: "Design Kubernetes ingress strategy with TLS, routing, rate limiting, DDoS protection.", a: "Implement Ingress Controller (nginx, Istio). Use cert-manager for TLS certificate automation. Implement path-based routing. Use rate limiting middleware. Implement WAF rules for security. Use load balancing across ingress replicas. Monitor ingress controller metrics. Implement graceful reload. Document routing rules." },
        { q: "Troubleshoot Kubernetes API server performance and etcd latency issues.", a: "Monitor API server latency with metrics. Check etcd database size (compact if needed). Monitor etcd leader elections. Check for slow API calls with audit logs. Implement API rate limiting. Use caching where possible. Monitor API server CPU/memory. Check for excessive reconciliation loops. Tune etcd performance parameters." },
        { q: "Implement Kubernetes tenant isolation and multi-tenancy at scale.", a: "Use namespaces for logical isolation. Implement ResourceQuotas per namespace. Use Network Policies for traffic isolation. Implement RBAC with namespace-scoped roles. Use PodSecurityPolicies for container restrictions. Implement storage isolation. Monitor resource usage per tenant. Implement cost allocation. Document isolation boundaries." },
        { q: "Design Kubernetes application deployment pipeline with testing, scanning, validation.", a: "Implement image build and scan stage. Run security tests (SAST/DAST). Validate manifests (kubeval, kube-score). Deploy to staging for integration tests. Implement smoke tests post-deployment. Monitor for regressions. Implement canary deployments. Use GitOps for production deployments. Implement approval gates." },
        { q: "Troubleshoot Kubernetes pod scheduling issues and optimize scheduler performance.", a: "Check node resources with 'kubectl top nodes'. Monitor pending pods for scheduling failures. Check node selectors/affinity rules. Verify PodDisruptionBudgets aren't blocking scheduling. Monitor scheduler metrics. Check for resource fragmentation. Use cluster autoscaler to provision capacity. Implement priority classes appropriately. Document scheduling policies." },
        { q: "Implement Kubernetes CNI plugin selection and troubleshooting (Calico, Cilium, Weave).", a: "Evaluate based on network policies, performance, security requirements. Implement appropriate CNI for workload type. Monitor CNI health. Troubleshoot with 'kubectl get nodes -o wide'. Check IP allocation issues. Monitor network latency. Implement IPAM management. Test failover scenarios. Keep CNI components updated." },
        { q: "Design Kubernetes upgrade strategy across hundreds of clusters and teams.", a: "Maintain cluster version support matrix. Plan phased upgrades by team. Test upgrades in sandbox first. Implement automated upgrade validation. Monitor for incompatibilities. Communicate breaking changes to teams. Provide migration guides. Implement rollback procedures. Track upgrade status. Maintain upgrade runbooks." }
    ],
    "Kubernetes Commands": [
        { q: "kubectl get nodes output columns?", a: "NAME (node identity), STATUS (Ready/NotReady), ROLES (control-plane/worker), AGE, VERSION (kubelet)." },
        { q: "kubectl describe pod debugging workflow?", a: "Shows events, conditions, containers, mounts; use --previous for crashed container logs; check Image, State, LastState." },
        { q: "kubectl logs expert usage?", a: "kubectl logs <pod> -c <container> gets specific container; -f streams live; --previous for crashed; --tail=50 recent lines." },
        { q: "kubectl exec vs port-forward?", a: "exec runs commands inside pod (e.g. exec -it bash); port-forward tunnels local port to pod service for testing." },
        { q: "kubectl top nodes vs pods?", a: "kubectl top nodes shows node CPU/memory; kubectl top pods shows pod resource consumption (requires metrics-server)." },
        { q: "kubectl get pod -o json filtering?", a: "Use -o json for raw output; pipe to jq for filtering: | jq '.items[] | select(.metadata.namespace==\"prod\")' ." },
        { q: "kubectl apply vs kubectl create?", a: "apply is declarative idempotent (create or update); create is imperative (fails if exists); prefer apply." },
        { q: "kubectl set image rollout workflow?", a: "kubectl set image deployment/myapp app=myimage:v2 triggers rolling update; monitor with kubectl rollout status." },
        { q: "kubectl rollout history and revision?", a: "kubectl rollout history deployment/app shows revisions; rollout undo <deployment> --to-revision=2 reverts." },
        { q: "kubectl patch vs apply?", a: "patch modifies specific fields in-place; apply replaces entire resource definition; patch useful for quick tweaks." },
        { q: "kubectl label and selector syntax?", a: "kubectl label pod mypod env=prod; select with -l env=prod; use = (equals), != (not-equals), in, notin operators." },
        { q: "kubectl annotate vs labels?", a: "Labels are indexable selectors for grouping; annotations store arbitrary metadata (audit, build info, docs)." },
        { q: "kubectl taint node edge-case?", a: "kubectl taint node mynode gpu=true:NoSchedule prevents pod scheduling unless tolerated; key=value:effect." },
        { q: "kubectl drain node procedure?", a: "kubectl drain <node> removes pods (respects PDB); cordons it; used before maintenance; kubectl uncordon to re-enable." },
        { q: "kubectl create configmap from file?", a: "kubectl create configmap mycfg --from-file=<path> mounts files as volume; --from-literal=key=value for inline." },
        { q: "kubectl create secret types?", a: "generic (key-value), tls (cert/key), docker-registry (credentials); create with --from-literal/--from-file or YAML." },
        { q: "kubectl proxy localhost debugging?", a: "kubectl proxy opens /api endpoint locally; enables direct API access without auth headers; useful for testing." },
        { q: "kubectl cluster-info dump for diagnosis?", a: "Exports cluster state (nodes, configs, events) to files; used for troubleshooting and audit trails." },
        { q: "kubectl auth can-i RBAC testing?", a: "kubectl auth can-i create pods --as=system:serviceaccount:default:mysa tests if SA has permission; supports --list." },
        { q: "kubectl wait condition polling?", a: "kubectl wait --for=condition=Ready pod/mypod timeout 300s waits until condition met or timeout." },
        { q: "kubectl delete with grace period?", a: "kubectl delete pod mypod --grace-period=60 allows pod 60s to shutdown; --force skips graceful termination." },
        { q: "kubectl debug ephemeral container?", a: "kubectl debug node/mynode -it creates temporary debugging container attached to node (1.25+)." },
        { q: "kubectl sniff live tcpdump?", a: "Requires sysdig plugin; kubectl sniff <pod> captures pod network traffic real-time for analysis." },
        { q: "kubectl explain resource fields?", a: "kubectl explain pod.spec.containers lists available fields with descriptions; helps understand resource YAML structure." },
        { q: "kubectl config context switching?", a: "kubectl config get-contexts lists all; kubectl config use-context <name> switches; stored in ~/.kube/config." },
        { q: "kubectl completion shell integration?", a: "source <(kubectl completion bash) enables tab-completion; add to .bashrc/.zshrc for persistent integration." },
        { q: "kubectl plugin architecture?", a: "Binaries named kubectl-<plugin> in PATH; invoked as kubectl <plugin>; enables custom subcommands (e.g. kubectx)." },
        { q: "kubectl api-resources discovery?", a: "kubectl api-resources lists all resource types; shows shortnames (po=pod), API groups, namespaced status." },
        { q: "kubectl version components?", a: "kubectl version shows client and server versions; useful for verifying cluster API compatibility." },
        { q: "kubectl get all across namespaces?", a: "kubectl get all -A shows pods, deployments, services etc across all namespaces; filters by namespace with -n." }
    ],
    "OpenShift": [
        { q: "oc login authentication?", a: "oc login <cluster-url> authenticates to OpenShift cluster; stores token in ~/.kube/config; supports --username --password flags." },
        { q: "oc new-project vs kubectl create namespace?", a: "oc new-project creates project (namespace + RBAC); kubectl create namespace creates only namespace; prefer oc new-project for OpenShift." },
        { q: "oc new-app source deployment?", a: "oc new-app <git-url> auto-detects language, builds image, creates deployment; combines git, s2i, image pull in single command." },
        { q: "Source-to-Image (s2i) build process?", a: "s2i fetches source, injects into builder image, compiles app, commits resulting image; enables rapid deployments from git repos." },
        { q: "oc expose service external access?", a: "oc expose service <service> creates Route (OpenShift ingress); automatically generates hostname; enables TLS termination." },
        { q: "oc get routes listing?", a: "oc get routes shows all routes in project; displays host (FQDN), service target, TLS termination mode (edge/reencrypt/passthrough)." },
        { q: "OpenShift Route vs Kubernetes Ingress?", a: "Route is OpenShift native (simpler, TLS built-in); Ingress is K8s standard (requires controller); OpenShift supports both." },
        { q: "oc rollout strategies?", a: "Rolling (default, zero-downtime), Recreate (downtime), Custom; oc set env, oc set image trigger rollouts automatically." },
        { q: "oc rollback to previous deployment?", a: "oc rollout undo deployment/<name> reverts to previous; oc rollout history deployment/<name> shows revisions." },
        { q: "Security Context Constraints (SCC)?", a: "OpenShift SCC restricts pod privileges (restricted, anyuid, privileged); oc get scc lists defaults; admins bind to ServiceAccounts." },
        { q: "oc adm policy RBAC grant?", a: "oc adm policy add-role-to-user <role> <user> grants role; add-cluster-role-to-user for cluster scope; list with get roles/clusterroles." },
        { q: "oc get events project diagnostics?", a: "oc get events shows pod lifecycle events; --field-selector involvedObject.kind=Pod filters by type; useful for debugging failures." },
        { q: "oc describe node resource allocation?", a: "oc describe node <node> shows allocatable resources, allocated resources, node conditions, kubelet version, system info." },
        { q: "OpenShift Operators and OperatorHub?", a: "Operators automate application lifecycle via CRDs; OperatorHub (web console) discovers operators; oc apply installs from YAML manifests." },
        { q: "oc create configmap and secret handling?", a: "oc create configmap <name> --from-file/--from-literal; oc create secret generic/tls/docker-registry; mounted as volumes or env." },
        { q: "oc exec and port-forward debugging?", a: "oc exec <pod> <command> runs inside pod; oc port-forward <pod> 8080:8080 tunnels port for local testing." },
        { q: "oc logs streaming and filtering?", a: "oc logs <pod> -f streams live; -c <container> selects container; --previous for crashed; --tail=100 recent lines." },
        { q: "oc patch resource inline edits?", a: "oc patch <resource> <name> --patch '{...}' applies strategic merge; -type=json for JSON patch operations." },
        { q: "OpenShift BuildConfig and ImageStream?", a: "BuildConfig orchestrates builds (s2i, docker, pipeline); ImageStream tracks image tags and triggers deployments on image push." },
        { q: "oc start-build trigger build pipeline?", a: "oc start-build <buildconfig> starts build immediately; --from-webhook triggers via webhook; monitor with oc logs -f bc/<name>." },
        { q: "oc process template expansion?", a: "oc process -f template.yaml -p PARAM=value expands parameters; oc apply <(oc process ...) creates resources in-cluster." },
        { q: "oc get all resources in project?", a: "oc get all shows pods, services, deployments, routes, builds, imagestreams; filter by type: oc get pods,services." },
        { q: "oc status project overview?", a: "oc status summarizes project topology, recent builds, pod warnings; visual alternative to kubectl describe all resources." },
        { q: "oc rsh remote shell pod access?", a: "oc rsh <pod> opens bash/shell session; simpler than oc exec bash; inherits pod environment variables." },
        { q: "oc delete cascade cleanup?", a: "oc delete deployment <name> removes pods automatically (cascade=true default); cascade=false orphans child resources." },
        { q: "OpenShift DeploymentConfig vs Kubernetes Deployment?", a: "DeploymentConfig (legacy) has automatic rollout triggers; Deployment (standard) requires operator to trigger; prefer Deployment in new projects." },
        { q: "oc set env environment variable injection?", a: "oc set env deployment/<name> VAR=value injects; updates deployment, triggers rollout; oc set env -e VAR removes variable." },
        { q: "oc set resources CPU/memory limits?", a: "oc set resources deployment/<name> --limits=memory=512Mi --requests=memory=256Mi sets resource constraints; applies to new pods." },
        { q: "OpenShift projects vs RBAC namespace isolation?", a: "Projects combine namespace, network isolation, RBAC; ServiceAccounts scoped to project; NetworkPolicy restricts traffic by namespace." },
        { q: "oc extract secret/configmap local inspection?", a: "oc extract secret/<name> --to=. exports files locally; oc extract configmap/<name> --keys=key.txt exports specific keys." }
    ],
    "Helm": [
        { q: "Chart design patterns for monolithic vs microservices architecture?", a: "Monolithic: single chart with complex values schemas. Microservices: umbrella chart with subchart dependencies, enabling independent versioning & deployment strategies (e.g., managed by ArgoCD GitOps)" },
        { q: "Handling multi-environment deployments: dev, staging, production?", a: "Use values overlay pattern with base values.yaml + envs/prod-values.yaml. Git-driven approach: separate branches/directories per env. Helm hooks + Kustomize overlays for environment-specific patches (taints, resource limits, replicas)" },
        { q: "Values schema (values.schema.json) for production validation?", a: "Enforce type constraints, required fields, min/max bounds. Fails at install-time preventing invalid deployments. Example: image.tag required string matching semver pattern, replicas minimum 2 for HA" },
        { q: "Chart testing strategy at scale with helm unittest and chart-testing?", a: "Unit tests validate template rendering with sample values.yaml files. Integration testing via 'helm lint' checks syntax. CI/CD: automated testing on PR, helm-ct validates across multiple Kubernetes versions & schemas" },
        { q: "Secrets management: SOPS vs Sealed Secrets vs External Secrets Operator?", a: "SOPS: transparent encryption, git-driven, IDE friendly. Sealed Secrets: K8s native cluster-scoped encryption keys. ExternalSecrets: pulls from vault/AWS Secrets Manager at runtime. Production: ExternalSecrets decouples secrets from charts" },
        { q: "Implementing Helm subcharts for shared infrastructure libraries?", a: "Library charts contain reusable templates (logging sidecars, observability, security policies) without installable resources. Dependencies in Chart.yaml with versions. Prevents duplication across 100+ microservice charts" },
        { q: "Helm hooks for database migrations, pre-flight checks, and cleanup?", a: "pre-install/upgrade hooks validate schema, run migrations (Job). post-install hooks notify external systems. pre-delete for backup/cleanup jobs. Annotation: helm.sh/hook: pre-upgrade, helm.sh/hook-weight: -5 for execution order" },
        { q: "Chart versioning and release management with SemVer and appVersion?", a: "Chart version: infrastructure code semver (bump for template changes). appVersion: application version (tracked separately). Enables independent updates and dependency lock-in for critical apps (e.g., DB version 5.7.x only)" },
        { q: "Preventing breaking changes in chart upgrades: deprecations and migration paths?", a: "Document deprecated values in NOTES.txt. Support old + new values simultaneously for one release. helm-docs generation tracks all options. Changelog entries per version. Test against real customer configs before release" },
        { q: "Helm release annotation and label management for compliance and auditing?", a: "Add labels: managed-by: helm, team: platform, env: prod. Annotations: deployed-by, deployment-timestamp, approval-status. Enables RBAC filtering, cost allocation, compliance auditing (who deployed what when)" },
        { q: "Dynamic template rendering using Helm's sprig functions for complex logic?", a: "sprig provides string manipulation, date, random, crypto functions. Example: {{ include 'mychart.labels' . }} with conditional logic, regex replacement. Advanced: lookup() function queries existing K8s resources for dynamic templates" },
        { q: "Multi-region Helm deployments with CloudFormation + Helm across AWS regions?", a: "Separate helm repos per region or single repo with regional overrides. Values overlays per region handling different instance types, endpoint URLs. Helm plugin chains CloudFormation stack outputs into values" },
        { q: "Helm OCI registry workflow and private artifact management at scale?", a: "Push to ECR/ACR/Artifactory using 'helm push <chart.tgz> oci://registry/path'. Auth via 'helm registry login'. Enables supply chain scanning, immutable releases, audit trails like container images" },
        { q: "Chart repository security: signing charts and verifying authenticity?", a: "GnuPG signing during chart upload (helm repo index --sign). Verification on install: helm install --verify validates chain. Provenance files track chart lineage and prevent tampering" },
        { q: "Resource quota and namespace limits per Helm release for multi-tenant clusters?", a: "Use Helm values to set ResourceQuota and NetworkPolicies per namespace. Example: {{ .Values.resourceQuota.requests.cpu }}. Prevents noisy neighbor problems in shared clusters" },
        { q: "Helm operator vs GitOps (ArgoCD, Flux) for declarative management at scale?", a: "Helm operator watches custom resources triggering releases. GitOps (ArgoCD): Git source-of-truth with automated reconciliation. Choice depends on operational model: Helm for programmatic control, GitOps for declarative CI/CD" },
        { q: "Post-deployment validation and smoke testing with Helm hooks and tests?", a: "helm test runs test pods with 'helm.sh/hook: test'. Example: verify API endpoints, check database connectivity. Fails entire release if tests fail, blocking production traffic" },
        { q: "Helm upgrade rollback strategies with atomic and keep-history flags?", a: "--atomic: automatic rollback on failure. --keep-history: retains failed release revision for debugging. Implement health checks + monitoring to detect failures within SLA window before rollback completes" },
        { q: "Handling stateful applications (databases, message queues) with Helm and StatefulSets?", a: "Values control storage claims, pod ordinals (headless services). PersistentVolumes via storage classes. Backup hooks via helm.sh/hook: pre-delete. Monitor pod identity, ordered startup/shutdown" },
        { q: "Compliance and policy enforcement: Kyverno/OPA policies with Helm templates?", a: "Mutating webhooks inject compliance labels/annotations via Helm. Validating policies enforce image registries, resource limits, security contexts. Example: all images must come from approved registries, enforce pod security standards" }
    ],
    "Terraform": [
        { q: "State management challenges at enterprise scale: splitting state across 50+ teams?", a: "Monolithic state causes conflicts and long lock contention. Solution: separate state per team/component (terraform_remote_state data sources), hierarchical module structure, Terraform Cloud workspace isolation, cross-stack references via outputs. Example: networking state in separate stack referenced by application stacks" },
        { q: "Multi-account AWS architecture with Terraform: organizational best practices?", a: "Root account for org/billing only. Separate accounts per environment (dev/staging/prod) + security/logging account. Cross-account assume roles via terraform. Terraform Cloud: workspace per account, shared tfstate in central account (read-only reference). Policy enforcement (Sentinel) across accounts" },
        { q: "Disaster recovery strategy: Terraform state backup and recovery procedures?", a: "S3 backend with versioning + MFA delete enabled. Cross-region replication for state buckets. State snapshots: daily exports to secure secondary location. Runbook: state corruption recovery via backup restore, test in non-prod first. DLM lifecycle for state archives (7-year retention compliance)" },
        { q: "Module design patterns: versioning, testing, and breaking changes management?", a: "Semantic versioning for modules (v1.2.3). Separate git repos per module with release tags. Source = 'git::https://repo/path?ref=v1.0.0'. Test matrix: terraform test block validates modules across input combinations. Changelog tracks breaking changes with migration docs" },
        { q: "Testing Terraform configurations: terraform test, terratest, and policy validation?", a: "terraform test: HCL assertions on outputs and values. terratest: Go framework for integration testing (create real infra, validate). Policy testing: OPA/Sentinel rules validate cost, security, compliance. CI/CD: all three layers before apply" },
        { q: "Cost optimization via Terraform: reserved instances, spot, right-sizing at scale?", a: "Reserved Instance modules with autogenerated SKU lookups. Spot pricing automation. Cost estimation: terraform plan -json piped to cost analyzer (Infracost integration). TTL tags on ephemeral resources. Scheduled scaling: var.business_hours controls instance counts" },
        { q: "Compliance-as-code: implementing audit trails and enforcement with Terraform?", a: "Outputs capture created resource ARNs/IDs for audit logging. CloudTrail tags link IaC changes to API calls. Sentinel policies enforce compliance frameworks (PCI-DSS tagging, encryption, IAM constraints). State file encryption mandatory (kms_key_id)" },
        { q: "Refactoring monolithic Terraform state: moved blocks and safe migration paths?", a: "moved { from = 'aws_instance.old' to = 'aws_instance.new' } prevents destroy/recreate. terraform apply -replace = 'resource' forces replacement. State manipulation: terraform state mv for advanced scenarios. Plan review critical to prevent outages" },
        { q: "Provider pinning and version management across 20+ regions and AWS accounts?", a: "required_providers with version = '~> 5.0' (bumps patch/minor). terraform lock file (terraform.lock.hcl) ensures consistent versions. Separate lock files per environment avoid accidental upgrades. Version upgrade process: test in dev, validate breaking changes" },
        { q: "Multi-region deployments: aliases, failover, and state synchronization strategies?", a: "Provider aliases: provider 'aws.us-east-1' { region = 'us-east-1' }. Separate state per region or cross-region state references. Active-passive failover via CloudFormation stack sets or Terraform workspaces. Replicated resources: for_each with map of regions" },
        { q: "Handling secrets in Terraform: vault, AWS Secrets Manager, sealed secrets?", a: "Vault as primary source: HCP Vault managed service with dynamic secrets. AWS Secrets Manager: data source queries secrets at apply time, never stored in state. Sealed Secrets operator for K8s. Avoid: hardcoding, committing .tfvars with secrets, logging sensitive outputs" },
        { q: "Terraform Cloud vs self-hosted Terraform Enterprise deployment comparison?", a: "Terraform Cloud: SaaS, cost per user, managed (no ops), limited customization. Enterprise: self-hosted, audit-friendly, network isolation, custom integrations (SSO, webhooks). Hybrid: Enterprise with private agents for connectivity requirements" },
        { q: "Dynamic infrastructure provisioning: generating resources from data files (CSV, JSON)?", a: "data 'local_file' reads CSV, jsonpath() parses structure. for_each with zipmap() creates resource map. Example: 100 subnets from JSON config file. Enables separation of infrastructure from data" },
        { q: "Implementing blue-green deployments with Terraform for zero-downtime infrastructure updates?", a: "Parallel environment provisioning: blue = aws_autoscaling_group 'v1', green = aws_autoscaling_group 'v2'. Load balancer traffic-weighted via aws_lb_target_group_attachment with weights. Health checks validate green before decommissioning blue" },
        { q: "Handling EC2 capacity reservation and dedicate host provisioning for compliance?", a: "aws_ec2_capacity_reservation reserves specific instance counts (avoid overselling). aws_ec2_host provisions dedicated hosts for licensing. Terraform integration: instance_family constraints link to reservations. BYOL tracking via tags" },
        { q: "Audit logging and change tracking: CloudTrail integration with Terraform state changes?", a: "Every terraform apply triggers API calls logged in CloudTrail with assumed role. State file in S3 enables bucket logging and object lambda auditing. Integration: CloudTrail events -> EventBridge -> Lambda -> custom tracking DB" },
        { q: "Module orchestration: coordinating 30+ modules across environments with dependencies?", a: "Root module aggregates child modules. terraform_remote_state data source chains outputs (networking -> app -> observability). Explicit dependencies: depends_on prevents race conditions. Workspace separation for parallel module development" },
        { q: "Performance optimization: reducing terraform plan time from 10min to <1min on large configs?", a: "Split state across regions and teams (10M+ resources per root). Lazy loading: -target resource for focused applies. Caching: terraform graph optimization via backend caching. Parallel apply: terraform apply -parallelism=50 (default=10)" },
        { q: "Cost allocation and chargeback: tagging strategy linked to Terraform resource creation?", a: "Enforce tags on all resources via Sentinel policies. Tag format: cost-center, team, project, environment. Terraform locals generate standard tags applied to all resources. Cost analyzer parses tags for chargeback (s3 ://cost-allocation bucket)" },
        { q: "Post-apply validation and reconciliation: automated testing and drift detection workflows?", a: "Terraform refresh detects real-world drift. Post-apply hooks run integration tests (curl endpoints, database queries). Scheduled drift detection: terraform plan runs hourly via CI/CD, alerts on changes. No-op runs verify state consistency" }
    ],
    "AWS": [
        { q: "AWS Organizations best practices: multi-account structure for 100+ accounts in enterprise?", a: "Root account: billing/org only (no workloads). OUs per environment (prod/staging/dev) + function (security/logging/networking). Service Control Policies (SCPs) enforce guardrails (block public RDS, restrict regions). Cross-account assume roles (least privilege)." },
        { q: "Cost optimization at $100M+ annual spend: strategies for reserved instances, savings plans, spot?", a: "Reserved Instance pool: 3-yr commitment saves 70% vs on-demand. Savings Plan mixing (Compute/EC2 blend). Spot instances (85% discount) for fault-tolerant batch workloads. Commitment discounts optimizer (Cost Explorer), chargeback model (cost allocation tags), RI sharing across accounts" },
        { q: "Security foundation: IAM best practices for 1000+ developers across 50 teams?", a: "Cross-account roles via AWS SSO / Identity Center (federated). Permission boundaries prevent privilege escalation. Least privilege: deny by default. Service-linked roles for managed services. No long-term user credentials (assume role via temp credentials). MFA enforced via SCP" },
        { q: "Disaster recovery: RTO/RPO targets and multi-region failover architecture?", a: "RTO 15min: active-active multi-region (Route 53 health checks). RPO <1hr: cross-region RDS replicas + DynamoDB global tables. Backup strategy: daily snapshots, cross-region copy, annual archive to Glacier. Runbook automation: Lambda/Systems Manager documents for failover" },
        { q: "High availability architecture: ELB, ASG, Multi-AZ patterns across 3 regions?", a: "ALB spanning 3 AZs with health checks (replace failed instances). ASG: target tracking policy scales on CPU/network. RDS Multi-AZ synchronous standby (automatic failover <2min). Databases: read replicas in other regions. Chaos testing (Gremlin) validates resilience" },
        { q: "Networking at scale: VPC design supporting 10000+ hosts, subnets, routing efficiency?", a: "Transit Gateway hub-and-spoke: centralizes routing, simplifies peering (vs 100s of peering connections). CIDR planning: class B (172.16.0.0/12) split into /16s per env. NAT Gateway (high availability): multi-AZ deployment. VPC Flow Logs to S3 + Athena for network analysis" },
        { q: "Data protection compliance: PCI-DSS, HIPAA, SOC2 implementation across AWS workloads?", a: "KMS encryption (data at rest) + TLS 1.2+ (in transit). Secrets Manager rotation policies (auto-rotate every 30days). VPC isolation (private subnets for sensitive data). GuardDuty + SecurityHub for threat detection. Audit logs: CloudTrail + Config rules + access logging (S3, RDS, VPC)" },
        { q: "S3 bucket security and data governance: preventing data leaks at scale?", a: "Default: Block Public Access enabled. Bucket policies enforce encryption (aws:SecureTransport). MFA Delete on versioned buckets. Access logs to separate bucket. S3 Intelligent-Tiering for cost optimization. Object Lock (WORM) for compliance archives. S3 Replication: cross-region + cross-account" },
        { q: "Secrets rotation at scale: Secrets Manager, Parameter Store, and external integrations?", a: "Secrets Manager: automatic rotation via Lambda (supports RDS, Redshift, DocumentDB native). Parameter Store: manual rotation via EventBridge + Lambda. Vault integration: external rotation source. Monitoring: failed rotations trigger SNS. Audit: CloudTrail records all secret access" },
        { q: "Container security: ECR scanning, image signing, and supply chain security?", a: "ECR: push with clair/trivy scanning (block high-severity images). Docker Content Trust signs images (cryptographic verification). Notary repositories store signatures. ECR lifecycle policies prune old images. VPC endpoints prevent internet exposure. Private registry for air-gapped networks" },
        { q: "EKS best practices: cluster autoscaling, security posture, and multi-tenancy?", a: "Cluster autoscaling: Karpenter (efficient bin-packing) vs Cluster Autoscaler. Pod security standards (PSS) enforce policies. RBAC: namespaced roles per team. Network policies restrict traffic between pods. Falco for runtime security. IRSA (IAM Roles for Service Accounts) fine-grained permissions" },
        { q: "Lambda at scale: coldstart optimization, concurrent execution limits, and cost control?", a: "Coldstart: Lambda SnapStart (java), container image vs zip (150MB limit). Reserved concurrency prevents throttling. Provisioned concurrency keeps instances warm (cost trade-off). ARM-based Graviton2 saves 20% cost. X-Ray tracing for performance analysis" },
        { q: "RDS production patterns: backup strategies, failover testing, and parameter group management?", a: "Automated backups: 35-day retention + cross-region copy. Manual snapshots for major upgrades. Failover testing: promote read replica, monitor promotion time. Parameter groups: custom for tuning (max_connections, slow_query_log). Enhanced Monitoring for OS-level metrics" },
        { q: "DynamoDB at scale: provisioning modes, global tables, and cost optimization?", a: "Provisioned capacity: predictable workloads, reserved capacity saves 25%. On-demand: bursty traffic, auto-scaling. Global tables: multi-region replication, eventual consistency. TTL for auto-cleanup. DynamoDB Streams trigger Lambda (real-time processing). Query optimization (GSI vs scan)" },
        { q: "CloudFront and edge caching: geographic performance optimization and DDoS protection?", a: "Distribution behaviors define cache rules (TTL, compression). Origin Shield (additional cache layer) reduces origin load. Field-level encryption for sensitive data (EC). WAF integration: rate limiting, geo-blocking, SQL injection protection. Lambda@Edge: compute at edge (auth, image optimization)" },
        { q: "EventBridge and SQS integration patterns for decoupled async architectures?", a: "EventBridge: event-driven fan-out (publish hundreds of rules). SQS: queue-based decoupling (FIFO for ordering, visibility timeout). DLQ (dead-letter queue) handles failed processing. Lambda consumers scale via SQS concurrency. Cross-account event routing via resource-based policies" },
        { q: "Compliance monitoring: AWS Config, Systems Manager, and automated remediation?", a: "Config rules: 100+ predefined rules (e.g., ec2-public-ip check, encryptionEnabled). Systems Manager Automation remediation: auto-repair config drift (e.g., enable versioning on S3). CloudTrail integration: audit trail for rule violations. Compliance scoring dashboard" },
        { q: "Cross-account log aggregation: CloudWatch, S3, and centralized SIEM integration?", a: "Logs Insights: cross-account queries via cross-account permissions. Central logging account: S3 bucket receives logs from all accounts (bucket policy). Splunk/ELK integration: Kinesis Firehose streams logs to external SIEM. Log retention: cost-optimized lifecycle (S3 Glacier after 90days)" },
        { q: "Networking deep-dive: VPC endpoints, PrivateLink, and zero-trust network access?", a: "Gateway endpoints (S3, DynamoDB) free, no NAT needed. Interface endpoints (SNS, SQS, Lambda) private connectivity. PrivateLink: expose services across accounts securely. NACLs + Security Groups (defense-in-depth). Network performance isolation: placement groups for EC2 clusters" },
        { q: "FinOps and cost accountability: tagging, showback, and chargeback models at scale?", a: "Tag compliance: SCP enforces mandatory tags (cost-center, team, project). Cost allocation reports grouped by tags. Reserved instance pool optimization (Compute Savings Plans). Spot instance fleet: 25-50% discount on diverse instance types. Estimated monthly: $1M+ saves $300K+ via RI + Spot" }
    ],
    "Azure": [
        { q: "What is an Azure Resource Group?", a: "Logical container for resources lifecycle + permissions grouping." },
        { q: "Difference between Azure VM Scale Set and AKS?", a: "VMSS scales VMs; AKS manages Kubernetes cluster orchestration." },
        { q: "Azure Storage account types?", a: "General-purpose v2 (blobs, queues, tables), Blob-only, File shares, Premium for performance." },
        { q: "What is Azure AD?", a: "Identity & access management (users, groups, app registrations, SSO)." },
        { q: "Explain Azure Functions.", a: "Serverless compute event-driven with consumption or premium plans." },
        { q: "What is Log Analytics?", a: "Query & analyze telemetry in Azure Monitor workspace using Kusto queries." },
        { q: "Difference between NSG and Azure Firewall?", a: "NSG filters traffic at subnet/NIC; Firewall is managed service with L3-L7 policies & threat intel." },
        { q: "What is ARM template?", a: "JSON declarative infrastructure definition deployed via Resource Manager." },
        { q: "How to manage secrets?", a: "Azure Key Vault for encryption keys, certs, secrets with RBAC/policies." },
        { q: "Availability Zones purpose?", a: "Physically separate locations for high availability and fault isolation." },
        { q: "Azure Policy purpose?", a: "Govern resource compliance (enforce tagging, security configurations)." },
        { q: "Difference between RBAC role and custom role?", a: "Built-in roles predefined; custom roles tailored set of allowed actions." },
        { q: "What is Azure Monitor?", a: "Unified platform for metrics, logs, alerts, insights across resources." },
        { q: "AKS node pool concept?", a: "Separate sets of nodes with different sizes/os for workload segregation." },
        { q: "Blob access tiers difference?", a: "Hot frequent access, Cool infrequent, Archive long-term offline rehydration needed." },
        { q: "ExpressRoute benefit?", a: "Private dedicated connection between on-prem and Azure improving reliability/security." },
        { q: "Managed identity use-case?", a: "Provides service principal for resources to access other Azure services without secrets." },
        { q: "Difference between Availability Set and Zone?", a: "Set groups VMs across fault/update domains; Zones physically separate datacenters." },
        { q: "Azure DevOps Pipelines vs GitHub Actions?", a: "Pipelines YAML similar, offers classic UI, enterprise integration; Actions GitHub-native workflow ecosystem." },
        { q: "Azure Front Door role?", a: "Global HTTP/HTTPS reverse proxy providing acceleration, caching, WAF." },
        { q: "Cosmos DB consistency levels?", a: "Strong, Bounded Staleness, Session, Consistent Prefix, Eventual trade off latency vs guarantees." },
        { q: "Scale set autoscaling metrics?", a: "CPU, memory (diagnostics), custom metrics promoting dynamic instance count adjustment." },
        { q: "Key Vault soft delete feature?", a: "Retains deleted secrets for recovery adding protection against accidental removal." },
        { q: "Azure Container Instances use-case?", a: "Run single containers serverlessly without orchestrator overhead." },
        { q: "Service Bus vs Event Hub?", a: "Service Bus enterprise messaging (queues/topics); Event Hub high throughput event ingestion." },
        { q: "WAF integration options?", a: "Azure Application Gateway or Front Door provide web application firewall capabilities." },
        { q: "SAP on Azure consideration?", a: "Use certified VM sizes, proximity placement groups, high memory throughput." },
        { q: "How to implement blue/green in Azure?", a: "Use Traffic Manager or Front Door routing split then switch after validation." },
        { q: "Azure Backup service purpose?", a: "Centralized backup management for VMs, SQL, files with policies and retention." },
        { q: "Reserving capacity savings?", a: "Purchase Reserved Instances for 1/3 year terms lowering compute costs significantly." }
    ],
    "GCP": [
        { q: "What is a GCP Project?", a: "Isolation boundary for resources, billing, IAM, APIs." },
        { q: "Difference between GCE and GKE?", a: "GCE provides VMs; GKE manages Kubernetes clusters with control plane automation." },
        { q: "Cloud Storage classes?", a: "Standard, Nearline, Coldline, Archive for increasing retrieval latency & decreasing cost." },
        { q: "What is Stackdriver (Cloud Operations)?", a: "Suite for logging, monitoring, tracing, error reporting." },
        { q: "Explain Cloud Functions vs Cloud Run.", a: "Functions for single-purpose event handlers; Cloud Run runs containers (HTTP, scale to zero)." },
        { q: "IAM primitive vs custom roles?", a: "Primitive broad (viewer, editor, owner); custom granular permissions set." },
        { q: "What is VPC peering?", a: "Connect two VPC networks privately allowing internal traffic without public internet." },
        { q: "Purpose of Service Account?", a: "Identity for applications/services to authenticate and access resources." },
        { q: "Cloud Pub/Sub use-case?", a: "Async messaging for decoupled microservices and event ingestion." },
        { q: "How to reduce GKE costs?", a: "Use autoscaling, spot (preemptible) nodes, right-size machine types, cluster location strategy." },
        { q: "Cloud SQL vs Cloud Spanner?", a: "Cloud SQL managed relational single-region; Spanner globally distributed strongly consistent horizontally scalable." },
        { q: "Difference between Standard and Premium support?", a: "Premium includes faster response SLAs, architectural guidance, dedicated TAM for enterprise." },
        { q: "BigQuery partitioning benefit?", a: "Reduces scanned data cost and improves query performance by limiting partitions." },
        { q: "GKE node auto-repair purpose?", a: "Automatically recreates unhealthy nodes to maintain cluster integrity." },
        { q: "Cloud Build function?", a: "Serverless CI platform building containers/artifacts with defined steps YAML." },
        { q: "Artifact Registry vs Container Registry?", a: "Artifact Registry unified multi-format with IAM fine-grain; Container Registry legacy service." },
        { q: "Workload Identity benefit?", a: "Access Google APIs from GKE without long-lived service account JSON keys." },
        { q: "Cloud Armor role?", a: "DDoS protection and WAF policies for external applications behind load balancers." },
        { q: "Filestore use-case?", a: "Managed NFS for applications needing shared POSIX filesystem (CMS, media processing)." },
        { q: "Difference between Cloud Tasks and Pub/Sub?", a: "Tasks for asynchronous task queue with scheduling & retries; Pub/Sub high throughput messaging." },
        { q: "KMS key ring concept?", a: "Organizes keys regionally for logical grouping and access control." },
        { q: "GKE Network Policy enablement?", a: "Requires network plugin supporting policies (Calico) and enabling feature on cluster creation." },
        { q: "Preemptible VM caveat?", a: "Short-lived (24h max) may terminate anytime; use for fault-tolerant batch workloads." },
        { q: "Cloud Trace purpose?", a: "Distributed tracing to analyze latency across microservices." },
        { q: "Billing export advantage?", a: "Detailed cost data to BigQuery enabling analysis, forecasting, anomaly detection." },
        { q: "Identity-Aware Proxy function?", a: "Secures web apps by enforcing access via Google Identity without VPN." },
        { q: "Cloud Scheduler use?", a: "Cron-based job scheduling invoking HTTP endpoints, Pub/Sub, or Cloud Tasks." },
        { q: "GKE PodSecurityPolicy replacement?", a: "Use Pod Security Admission (baseline/restricted profiles) after PSP deprecation." },
        { q: "Bigtable vs BigQuery difference?", a: "Bigtable low-latency NoSQL wide-column; BigQuery analytical columnar warehouse for SQL queries." },
        { q: "Cloud Run concurrency setting?", a: "Controls simultaneous requests per container instance affecting scaling & efficiency." }
    ],
    "Ansible": [
        { q: "What is Ansible idempotency?", a: "Repeated play runs produce same state; modules report changed only when modifications occur." },
        { q: "Inventory purpose?", a: "Defines hosts and groups targeted by playbooks (INI/YAML/dynamic)." },
        { q: "Difference between playbook and role?", a: "Playbook orchestrates tasks; role is reusable structured collection (tasks, vars, handlers)." },
        { q: "Handlers usage?", a: "Run at end if notified by tasks (e.g., restart service after config change)." },
        { q: "How to encrypt sensitive vars?", a: "Use ansible-vault encrypt or vault encrypted files loaded at runtime." },
        { q: "What are facts?", a: "System information gathered by setup module accessible via hostvars." },
        { q: "Dynamic inventory example?", a: "AWS EC2 plugin fetching hosts automatically based on tags." },
        { q: "Jinja2 templating usage?", a: "Render variables, conditionals, loops in templates and playbooks." },
        { q: "How to limit run to a single host?", a: "--limit hostname parameter or inventory group name." },
        { q: "Difference between when vs register?", a: "register stores task result; when applies conditional execution based on variables/results." },
        { q: "Block usage purpose?", a: "Group tasks with shared error handling or conditional logic." },
        { q: "Strategy linear vs free?", a: "linear waits for all hosts each task; free lets hosts continue independently." },
        { q: "Forks setting impact?", a: "Controls parallelism (# of hosts processed concurrently)." },
        { q: "Delegate_to use-case?", a: "Run task on different host (e.g., load balancer) while referencing inventory variables." },
        { q: "Difference between vars_files and include_vars?", a: "vars_files static at play start; include_vars dynamic at runtime conditional." },
        { q: "Role defaults vs vars precedence?", a: "defaults lowest precedence; vars higher override defaults." },
        { q: "Explain become mechanism?", a: "Privilege escalation (sudo) controlled by become, become_user, become_method." },
        { q: "Idempotency test technique?", a: "Run play twice expecting second to show zero changed tasks." },
        { q: "Vault rekey purpose?", a: "Change encryption password for existing vaulted files enhancing security rotation." },
        { q: "Ansible Collections?", a: "Packaging modules/roles/plugins for distribution via Galaxy (namespaced)." },
        { q: "Execution environment (EE)?", a: "Containerized predefined runtime with consistent dependencies for automation." },
        { q: "Pull vs push mode?", a: "Push default control node initiates; pull agents fetch tasks (rare usage)." },
        { q: "How to speed up SSH?", a: "Enable pipelining, control persistent connections, disable fact gathering if not needed." },
        { q: "Check mode purpose?", a: "Dry run simulating changes without modification to validate tasks (not all modules fully support)." },
        { q: "Local action vs delegate_to localhost?", a: "local_action is shorthand; delegate_to more explicit supports other features." },
        { q: "Module vs plugin difference?", a: "Module executes remote tasks; plugins extend core (lookup, filter, connection)." },
        { q: "Conditionals with failed_when?", a: "Override failure logic for complex success criteria beyond return code." },
        { q: "Registering loop results?", a: "Loop registers list of per-item results accessible via result.results[]." },
        { q: "Inventory host vars overriding group vars?", a: "Host-specific variables have higher precedence than group variables." },
        { q: "Mitigating slow facts gathering?", a: "Limit facts with gather_subset=min or disable with gather_facts: false when unnecessary." }
    ],
    "SaltStack": [
        { q: "What is SaltStack?", a: "Configuration management & remote execution framework supporting event-driven automation." },
        { q: "Master / Minion model?", a: "Central master controls minions via secure message bus (ZeroMQ); minions accept signed commands." },
        { q: "Difference vs Ansible?", a: "Salt has always-on minions & event bus; Ansible is primarily push over SSH (no persistent agent)." },
        { q: "What are states?", a: "Declarative YAML definitions enforcing system configuration (pkg.installed, file.managed)." },
        { q: "What is highstate?", a: "Full convergence run applying all mapped states (salt \"minion\" state.apply or state.highstate)." },
        { q: "Pillars purpose?", a: "Secure data (secrets, per-environment vars) targeted to minions; not exposed like grains." },
        { q: "Grains definition?", a: "Static host facts (OS, roles, custom tags) for targeting & conditional logic." },
        { q: "Targeting types?", a: "Glob, list, regex, grain, pillar, compound, nodegroups for selecting minions." },
        { q: "Requisites require vs watch?", a: "require ensures order dependency; watch triggers reactive changes (e.g., service reload)." },
        { q: "Idempotence handling?", a: "Modules check current state before action; states only change when drift detected." },
        { q: "Module vs state module?", a: "Execution modules perform ad-hoc tasks; state modules enforce desired configuration." },
        { q: "Formulas meaning?", a: "Reusable state collections packaged for sharing (like roles)." },
        { q: "Event bus function?", a: "Publishes real-time events (state changes, reactor triggers) enabling automation workflows." },
        { q: "Reactors purpose?", a: "Map events to actions (run states, orchestration) enabling event-driven remediation." },
        { q: "Beacons usage?", a: "Minion-side monitors raise periodic or threshold events (file changes, load spikes)." },
        { q: "Orchestrate runner?", a: "state.orchestrate executes cross-minion orchestration leveraging master-only states." },
        { q: "salt-ssh use-case?", a: "Agentless execution for systems without minion installed using temporary Python code." },
        { q: "salt-run manage.up?", a: "Lists responsive minions helping verify connectivity and key acceptance." },
        { q: "Where is master config?", a: "Typically /etc/salt/master defines interfaces, file roots, pillar roots, performance tuning." },
        { q: "Performance tuning options?", a: "Adjust worker_threads, enable syndic, optimize file_roots & disable unused returners." },
        { q: "Returners concept?", a: "Send execution results to external systems (Redis, MySQL, Elasticsearch)." },
        { q: "Salt Mine purpose?", a: "Shared data cached by minions (publish selected info) accessible to others during states." },
        { q: "Scheduling tasks?", a: "schedule config runs functions at intervals (cron-like) defined in minion or master config." },
        { q: "Key management security?", a: "Minion keys must be accepted; revoke keys on compromise; use autosign cautiously." },
        { q: "Wheel vs runner?", a: "Wheel modules manage master (keys, config); runners execute utility logic on master not minions." },
        { q: "Refreshing pillars?", a: "salt \"*\" saltutil.refresh_pillar updates pillar data cache before applying states." },
        { q: "Selective state application?", a: "state.apply specific.sls limits run to chosen SLS files instead of full highstate." },
        { q: "failhard option?", a: "Stops further state execution on first failure to avoid cascading issues." },
        { q: "Test (dry-run) mode?", a: "state.apply test=True shows planned changes without enforcing them." },
        { q: "Batch execution?", a: "salt -b <size> \"*\" cmd.run \"...\" runs across minions in groups reducing load spikes." },
        { q: "Difference between grains and pillars security?", a: "Grains visible to all; pillars restricted & encrypted for targeted minions only." }
    ],
    "Prometheus": [
        { q: "What is Prometheus?", a: "Time-series monitoring & alerting system using pull model and PromQL queries." },
        { q: "Explain scrape interval impact.", a: "Defines sample resolution; shorter = higher fidelity + storage cost." },
        { q: "What are exporters?", a: "Processes exposing metrics in Prometheus format (node exporter, blackbox)." },
        { q: "Purpose of Alertmanager?", a: "Deduplicates, groups, routes alerts to receivers with silencing & inhibition logic." },
        { q: "PromQL rate() function?", a: "Calculates per-second average increase of counter over range vector (avoids resets)." },
        { q: "Difference between gauge and counter?", a: "Counter only increments (resets to zero); gauge can go up/down (current value)." },
        { q: "Label cardinality concern?", a: "Excess combinations explode memory/time; avoid high-cardinality (user IDs)." },
        { q: "Remote write?", a: "Ship samples to long-term storage/backends (Cortex, Thanos) for durability & scaling." },
        { q: "Service discovery usage?", a: "Automatically finds targets (Kubernetes, EC2) avoiding manual static config." },
        { q: "Histogram vs summary?", a: "Histogram offers aggregation across instances; summary can't be aggregated (client-side quantiles)." },
        { q: "PromQL sum by() usage?", a: "Aggregate metrics grouped by labels (e.g., sum by(instance)(rate(http_requests_total[5m]))." },
        { q: "What is recording rule?", a: "Precompute frequent or expensive queries storing new time-series for efficiency." },
        { q: "Alerting rule structure?", a: "Expression, for duration, labels, annotations describing alert context." },
        { q: "Prometheus retention considerations?", a: "Long retention increases disk & memory; external long-term storage recommended for multi-year." },
        { q: "Downsampling purpose?", a: "Reduce resolution over time (Thanos/Cortex) optimizing storage while preserving trend visibility." },
        { q: "Blackbox exporter use-case?", a: "Probe endpoints (HTTP, ICMP, TCP) for availability and latency metrics." },
        { q: "Node exporter key metrics?", a: "CPU, memory, disk, filesystem, network exposing host health." },
        { q: "PromQL offset modifier?", a: "Query data at past relative time window for comparisons (e.g., rate(metric[5m]) offset 1h)." },
        { q: "Why avoid high-cardinality labels?", a: "Memory blow-up & slow queries due to explosion of time-series combinations." },
        { q: "Exemplar support?", a: "Link traces or logs to specific metric samples enhancing correlation (OpenTelemetry integration)." },
        { q: "Federation concept?", a: "Pull metrics from multiple Prometheus servers into a central aggregator." },
        { q: "Query performance tuning?", a: "Reduce label regex usage, limit large ranges, rely on recording rules." },
        { q: "Alert inhibition?", a: "Suppress related alerts if a parent alert (e.g., service down) already firing." },
        { q: "Silence vs inhibition?", a: "Silence manually mutes alerts; inhibition automatic based on rule conditions." },
        { q: "Prometheus scalability challenge?", a: "Single-node design; horizontal scale via Cortex/Thanos sharding/replication." },
        { q: "TLS scraping configuration?", a: "Set tls_config in scrape config with cert_file/key_file/ca_file for secure endpoints." },
        { q: "Promtool function?", a: "Validates config files and rules, performs query performance checks." },
        { q: "Label relabel_config purpose?", a: "Modify target labels during discovery for grouping, dropping, rewriting." },
        { q: "Difference between increase() and rate()?", a: "increase sums raw counter delta; rate normalizes per-second average over range." }
    ],
    "Grafana": [
        { q: "What is Grafana?", a: "Visualization platform connecting to multiple data sources (Prometheus, Loki, etc.)." },
        { q: "Data source plugin role?", a: "Integrates new backend types providing query editor and retrieval logic." },
        { q: "Templating variables use?", a: "Dynamic dashboards filtering by environment, cluster, instance, etc." },
        { q: "Alerting mechanism?", a: "Define rules evaluating queries; send notifications via channels (Slack, PagerDuty)." },
        { q: "Provisioning dashboards?", a: "Manage as code via YAML/JSON definitions loaded on startup." },
        { q: "What is Loki?", a: "Log aggregation system integrated with Grafana using labels similar to Prometheus." },
        { q: "Annotations purpose?", a: "Overlay events on graphs (deploys, incidents) for context." },
        { q: "Transformations usage?", a: "Post-process query results (merge, group, calculate differences)." },
        { q: "Explore vs Dashboard?", a: "Explore ad-hoc queries/troubleshooting; dashboards are curated persistent views." },
        { q: "How to secure Grafana?", a: "Enable auth (OAuth, SSO), enforce roles, limit data source permissions, enable TLS and audit logs." },
        { q: "Folder structure purpose?", a: "Organize dashboards with permissions boundaries for teams." },
        { q: "Grafana provisioning for datasources?", a: "YAML in provisioning/datasources loads connections automatically on startup." },
        { q: "Loki log label design?", a: "Keep low cardinality labels (app, env); avoid unique IDs to preserve performance." },
        { q: "State timeline panel use?", a: "Visualize state changes over time (deploy phases, health states)." },
        { q: "SLO visualization approach?", a: "Graph error budget burn, compliance percent, annotate releases." },
        { q: "Grafana OnCall purpose?", a: "Incident response scheduling, escalations integrated with alerts." },
        { q: "Difference between classic and unified alerting?", a: "Unified merges alert systems providing consistent evaluation and silencing." },
        { q: "Image renderer plugin use?", a: "Generate static images of panels for reports or alerts attachments." },
        { q: "Dashboard JSON export/import?", a: "Enables version control & sharing; stored as JSON definition." },
        { q: "Secure datasource credentials?", a: "Stored encrypted in database; restrict admin access; rotate API keys." },
        { q: "Alert deduplication method?", a: "Group by labels to reduce noise; configure appropriate evaluation intervals." },
        { q: "Grafana performance tuning?", a: "Adjust concurrent queries, enable caching, optimize datasource queries." },
        { q: "Query inspector tool?", a: "Shows raw query, timing, data frames aiding optimization." },
        { q: "Panel repeat feature?", a: "Generate multiple panel instances per variable value dynamically." },
        { q: "Transform 'Add field from calculation'?", a: "Compute new metric derived from existing fields (ratios, differences)." },
        { q: "Alert silence vs pause?", a: "Silence stops notifications; pause halts rule evaluation temporarily." },
        { q: "Multi-tenancy approach?", a: "Use orgs or separate instances; control access with folders and roles." },
    { q: "Grafana Loki query basics?", a: "Select streams with label match {app=\"api\"} then filter | logfmt | unwrap patterns." },
        { q: "Annotations automatically from alerts?", a: "Configure rule to add event annotations when firing for timeline correlation." }
    ],
    "SRE Concepts": [
        { q: "What is an SLO?", a: "Service Level Objective: target reliability (e.g., 99.9% availability)." },
        { q: "Error budget meaning?", a: "Allowed failure time proportion between SLO and 100% enabling controlled risk & release velocity." },
        { q: "Toil definition?", a: "Manual, repetitive, automatable operational work providing no enduring value." },
        { q: "Blameless postmortem value?", a: "Focuses on learning/system improvement rather than individual blame encourages transparency." },
        { q: "What is MTTR?", a: "Mean Time To Repair/Recover: average duration to restore service after incident." },
        { q: "Capacity planning goal?", a: "Forecast resource needs to meet demand without overprovision or performance degradation." },
        { q: "Difference between monitoring and observability?", a: "Monitoring checks known conditions; observability reveals internal state from outputs aiding unknown issue discovery." },
        { q: "Release freeze justification?", a: "Pause changes during critical events to reduce risk and stabilize platforms." },
        { q: "What are golden signals?", a: "Latency, traffic, errors, saturation – primary metrics for service health." },
        { q: "Proactive vs reactive incident response?", a: "Proactive prevents through automation & testing; reactive addresses issues after occurrence." },
        { q: "Mean Time Between Failures (MTBF)?", a: "Average time between inherent component failures representing reliability." },
        { q: "Error budget burn rate?", a: "Speed at which error budget consumed guiding release throttling decisions." },
        { q: "Canary analysis automation?", a: "Compare metrics of baseline vs canary deployments scoring deviations." },
        { q: "Incident severity levels?", a: "Structured categorization (SEV-1 critical outage to SEV-4 minor) guiding response urgency." },
        { q: "GameDay exercise?", a: "Practice simulated failure scenarios to validate resilience and response processes." },
        { q: "Chaos engineering purpose?", a: "Inject controlled failure to uncover weaknesses and build confidence in system behavior." },
        { q: "Runbook importance?", a: "Step-by-step operational procedures enabling faster, consistent incident handling." },
        { q: "On-call fatigue mitigation?", a: "Balanced rotations, load reduction, automation, psychological safety support." },
        { q: "SLI examples?", a: "Request success rate, latency percentiles, availability, durability metrics representing user experience." },
        { q: "Progressive delivery?", a: "Incremental feature exposure (canary, feature flags) reducing risk of large releases." },
        { q: "Reliability vs velocity trade-off?", a: "Higher reliability may slow change; error budget balances innovation and stability." },
        { q: "Postmortem key sections?", a: "Summary, impact, timeline, root causes, contributing factors, corrective actions, lessons learned." },
        { q: "Automated rollback trigger?", a: "Metric/health check crossing threshold initiates revert of recent deployment." },
        { q: "Capacity headroom concept?", a: "Buffer resources above normal peak for absorbing unexpected spikes." },
        { q: "Handling noisy alerts?", a: "Deduplicate, tune thresholds, implement multi-condition alerts, escalate only actionable ones." },
        { q: "Error budget policy example?", a: "If burn > 2x allowed, freeze features until budget recovered." },
        { q: "Shift-right testing?", a: "Observe real user traffic in production experiments to validate resilience." },
        { q: "Health check layering?", a: "Basic liveness, dependency checks, synthetic transactions for deep validation." },
        { q: "Operational maturity model?", a: "Stages evaluating practices (monitoring, automation, incident processes) guiding improvement roadmap." },
        { q: "Golden signal saturation examples?", a: "CPU usage near limit, queue length growth, memory pressure impacting latency." }
    ],
    "CI/CD": [
        { q: "Define Continuous Integration.", a: "Frequently merging code to shared branch with automated builds & tests for fast feedback." },
        { q: "Define Continuous Delivery.", a: "System always in deployable state; deployment requires manual trigger but is routine & low risk." },
        { q: "Continuous Deployment?", a: "Automatic production releases after pipeline success with minimal human gatekeeping." },
        { q: "What is a pipeline artifact?", a: "Output (build packages, images) passed between stages reused for deployment & testing." },
        { q: "Canary deployment purpose?", a: "Release to small subset, observe metrics, reduce blast radius before full rollout." },
        { q: "Blue/Green strategy?", a: "Two production environments; switch traffic after verifying new version enabling quick rollback." },
        { q: "Rollback approaches?", a: "Redeploy previous artifact, revert commit, traffic switch (blue/green), feature flag disable." },
        { q: "Pipeline gating?", a: "Quality checks (tests, lint, security scan) required to proceed to next stage or deploy." },
        { q: "Why shift-left testing?", a: "Catch defects earlier lowering cost; integrate into CI rather than later phases." },
        { q: "Ephemeral environment benefit?", a: "Isolated short-lived test stack per PR enabling realistic integration validation." },
        { q: "Purpose of build cache?", a: "Accelerate subsequent builds by reusing compiled artifacts or dependencies." },
        { q: "Trunk-based development relation?", a: "Short-lived branches, frequent merges reduce integration pain and enable CI effectiveness." },
        { q: "Pipeline as code benefit?", a: "Versioned, reviewable, reproducible, portable across environments." },
        { q: "Test pyramid concept?", a: "Emphasize more unit tests, fewer integration, minimal UI for fast reliable feedback." },
        { q: "Deployment ring strategy?", a: "Stage rollout across user cohorts (internal, beta, general) mitigating risk." },
        { q: "Feature flags advantage?", a: "Decouple deployment from release enabling progressive exposure and fast rollback." },
        { q: "Build reproducibility practices?", a: "Pin dependencies, deterministic builds, immutable artifacts, isolated environments." },
        { q: "Pipeline observability metrics?", a: "Lead time, failure rate, MTTR, deployment frequency (DORA)." },
        { q: "Rollback automation trigger?", a: "If health metrics degrade beyond threshold after deploy automatically revert." },
        { q: "Parallel job optimization?", a: "Split tests by timing data, cache dependencies, avoid serialization for independent steps." },
        { q: "Artifact promotion process?", a: "Move same artifact across stages (dev->staging->prod) to ensure identical code deployed." },
        { q: "Security scanning integration?", a: "Include SAST/DAST/Dependency scans gating promotion with severity thresholds." },
        { q: "Immutable artifact storage?", a: "Write-once repository prevents tampering ensuring integrity for compliance." },
        { q: "Release notes automation?", a: "Generate from commit messages, PR labels, conventional commits formatting for stakeholders." },
        { q: "Pipeline drift detection?", a: "Compare pipeline config across branches/environments ensuring consistency." },
        { q: "Continuous verification meaning?", a: "Post-deploy live checks and metrics evaluation validating success beyond static tests." },
        { q: "Blue/green plus DB migration handling?", a: "Use backward-compatible migrations, expand->migrate->contract pattern ensuring old version tolerance." },
        { q: "Pipeline secret management?", a: "Inject from vault or secret manager at runtime; avoid env logging, rotate regularly." },
        { q: "Canary metric selection?", a: "Error rate, latency, saturation, business KPIs to judge incremental rollout health." },
        { q: "Design end-to-end CI/CD pipeline for microservices architecture with 50+ services.", a: "Source control (Git) triggers webhook to CI system (Jenkins, GitLab CI, GitHub Actions). Build stage: compile, unit test, SAST scan. Registry push: scan image, sign with GPG, push to private registry. CD stage: deploy to staging via Helm, run integration tests. Approval gate for production. Progressive rollout: canary (5%), then full rollout. Automated rollback on metric degradation. Maintain audit trail of every deployment." },
        { q: "How to design a CI/CD pipeline that reduces deployment time from 2 hours to 15 minutes?", a: "Parallelize stages: build, test, scan run concurrently. Implement build cache (Docker layer caching, Maven cache). Cache dependencies and test results. Use fast health checks (avoid long tests in critical path). Pre-stage artifacts. Implement fast image distribution (image warming on nodes). Skip tests for infrastructure changes. Optimize network latency between build agents and artifact storage. Profile bottlenecks and remove serial dependencies." },
        { q: "Design security scanning strategy across entire CI/CD pipeline (shift-left).", a: "Pre-commit hooks: git-secrets, detect-secrets. SCM: SAST via SonarQube, dependency scanning via Dependabot. Build: container image scanning (Trivy), image signing (Cosign). Registry: re-scan on push/pull. Deploy: policy validation (OPA/Kyverno). Runtime: DAST via OWASP ZAP, runtime security (Falco). Quarterly: penetration testing, vulnerability assessment. Block deployments on high-severity findings." },
        { q: "Design artifact management strategy for compliance-heavy environment (fintech, healthcare).", a: "Immutable artifact storage with versioning and tagging. Cryptographic signing of all artifacts (Cosign for containers, GPG for binaries). Audit trail: who created, when, from what source commit. Vulnerability scanning on push and periodically. Retention policy per compliance requirement (typically 7 years for healthcare). Separate registries per environment (dev, staging, prod). Access control via RBAC. Encryption at rest and in transit." },
        { q: "How to implement multi-stage deployment across 3 regions with canary validation?", a: "Canary stage: deploy to 5% of one region, compare error rate, latency, resource usage vs baseline. Use statistical significance testing to detect degradation. Auto-rollback if metrics exceed thresholds. Roll forward: 20% in region 1. Next: deploy to region 2 and 3 same pattern. Use service mesh (Istio) for traffic splitting. Feature flags for progressive feature exposure. Maintain traffic shift capability for instant rollback." },
        { q: "Design solution for managing secrets in CI/CD pipeline safely.", a: "Never commit secrets to Git. Use vault (HashiCorp, cloud-native) as central source. Inject secrets at runtime via environment variables or files. Rotate secrets regularly (30-90 days). Audit all secret access. Use dynamic secrets (generated per request). Implement least-privilege secret access. Never log secrets. Separate secrets per environment. Use sealed secrets for K8s. Implement secret scanning in repos (git-secrets)." },
        { q: "How to implement effective feedback loop for developers in CI/CD pipeline?", a: "Fast pipeline (< 10 minutes for full validation). Clear error messages showing which test failed and why. Link to logs and dashboards. Instant notifications on failures (Slack, email). Run tests in parallel by timing data. Implement code review integration (mandatory approvals). Show metrics in notifications (build time trend). Implement commit status checks preventing merge of failed builds. Dashboard showing pipeline health." },
        { q: "Design deployment strategy that enables daily releases with zero downtime.", a: "Blue-green deployments: two production environments, instant traffic switch. Rolling deployments: gradually replace old instances. Feature flags: decouple deployment from release. Canary deployments: 5% traffic initially, observe metrics. Database migrations: backward-compatible, expand->migrate->contract. API versioning: maintain old API versions temporarily. Health checks: liveness, readiness, startup probes. Automated rollback: on metric degradation." },
        { q: "How to design CI/CD pipeline for stateful services (databases, message queues)?", a: "Separate database migration pipeline: test migrations on staging replica first. Use online schema change tools (gh-ost). Application code handles both old/new schemas. Dual-write during transition. Implement point-in-time recovery. Backup before major changes. Test rollback procedures. Use health checks to validate data integrity. Monitor replication lag. For message queues: ensure ordering semantics, implement deduplication, test consumer compatibility." },
        { q: "Design approach for handling configuration management across environments (dev, staging, prod).", a: "12-factor app principles: config via environment variables. Infrastructure-as-code (Terraform) for infrastructure config. Helm/Kustomize for Kubernetes config. Git-driven: all config in version control except secrets. Validation: schema validation in CI/CD. GitOps: Git as source of truth, reconciliation ensures actual state matches. Review config changes in PR. Monitor drift: alert on manual changes. Document configuration requirements." },
        { q: "How to implement feature flags effectively in CI/CD workflow?", a: "Use feature flag platform (LaunchDarkly, Unleash) instead of code branches. Define flag lifecycle: development, testing, gradual rollout, cleanup. Implement targeting rules: user segments, geographic locations, percentages. Monitor flag behavior: track which code paths executed. Audit: log all flag changes. Remove flags after release (technical debt). Integrate with deployment: auto-flag management during releases. Dashboard showing active flags." },
        { q: "Design disaster recovery strategy for CI/CD infrastructure itself.", a: "Replicate pipeline infrastructure across regions. Backup pipeline configuration and history. Implement alerting for pipeline failures. Runbooks for recovery. Test disaster recovery procedures quarterly. Maintain backup CI/CD system in standby. Document pipeline dependencies and critical configurations. Implement automated backups of artifact storage. Use infrastructure-as-code for rapid reprovisioning. Monitor pipeline health continuously." },
        { q: "How to measure CI/CD effectiveness and track improvement?", a: "DORA metrics: deployment frequency, lead time for changes, MTTR, change failure rate. Build time: measure and track trends. Test coverage: maintain >80% for critical paths. Security scan findings: track remediation time. Artifact storage growth: monitor and optimize. Pipeline success rate: aim for >95%. Deployment duration: measure elapsed time. Rollback frequency: monitor and investigate. Cost per deployment: optimize resources. Developer satisfaction surveys." },
        { q: "Design approval and gating process for production deployments balancing speed and safety.", a: "Automated gates: run all tests, security scans, policy validation. Require approval for production from owner. Risk-based approval: minor bug fix auto-approve vs major features require review. Separation of duties: deployer != approver. Scheduled deployments: avoid Friday afternoon, off-hours. Deployment windows: coordinate across teams. Change advisory board for major changes. Approval timeout: if not approved within 24h, request expires. Document approval decisions." },
        { q: "How to implement effective test automation in CI/CD pipeline (test pyramid)?", a: "Unit tests: fast, isolated, >80% of tests. Integration tests: verify service interactions, <15% of tests. UI/e2e tests: validate user workflows, <5% of tests. Run unit tests first (5 min). Parallel integration tests (10 min). Nightly: full e2e tests. Use realistic test data (not production data). Test against staging with live dependencies. Maintain test performance: delete slow tests. Mock external services. Use test containers for database tests." },
        { q: "Design approach for progressive deployment using deployment rings with validation gates.", a: "Internal ring: deploy to development environment, run smoke tests. Early adopter ring: 5-10% of users, monitor metrics. Standard ring: 50% of users, validate no regressions. Final ring: 100% rollout. Each ring has exit criteria: error rate < 0.1%, latency p95 < threshold, customer satisfaction metrics. Automated metrics collection and comparison against baseline. Manual approval at gates for risk assessment. Rollback capability at each ring." },
        { q: "How to design CI/CD pipeline that supports multiple languages and frameworks (polyglot)?", a: "Build stage: language-specific builders (Docker images with SDKs). Each language has build script (build.sh) at root. Standard artifact format: Docker images. Pipeline language-agnostic: use generic build, test, push stages. Dependencies per language handled in container build. Testing: language-specific test runners. Coverage: aggregate reports. Linting and formatting: language-specific tools. Documentation: standardized per-language. Training: provide templates for new languages." },
        { q: "Design solution for managing database schema changes in zero-downtime deployments.", a: "Backward-compatible migrations: add column (v1), application handles both (v2 code supports new column), remove old (v3). Online schema change tools: gh-ost, pt-online-schema-change avoid table locks. Separate migration pipeline: run before application deployment. Dual-write during transition: write to both old and new schema. Data validation: verify correctness post-migration. Rollback plan: restore from backup. Monitor replication lag: ensure replicas stay in sync. Test migrations on staging replica." },
        { q: "Design CI/CD for compliance-driven releases (SOC2, PCI-DSS, HIPAA).", a: "Immutable artifacts: sign and store with audit trail. Policy enforcement: OPA rules validate compliance (encryption, logging, access controls). Automated scanning: SAST, dependency, container scans mandatory. Approval process: security/compliance review gates. Change documentation: linked to risk assessment. Audit logging: CloudTrail/equivalent logs all deployments. Data handling: sensitive data never in logs. Encryption: in-transit (TLS) and at-rest (KMS). Regular audits: quarterly compliance checks. Incident response: documented procedures for security events." },
        { q: "How to implement effective incident response automation in CI/CD?", a: "Automated alerts: anomaly detection on metrics post-deployment. Auto-rollback triggers: error rate/latency exceeding thresholds. Incident severity classification: auto-trigger based on impact. Page on-call engineer: immediate notification. War room: auto-create Slack channel with relevant dashboards. Runbook automation: execute recovery steps automatically where safe. Logging: auto-collect logs at incident time. Communication: auto-notify stakeholders. Post-mortem: auto-extract relevant logs and metrics for analysis. Feedback loop: update runbooks and policies." }
    ],
    "DevSecOps": [
        { q: "What is DevSecOps?", a: "Integrating security practices early and continuously across DevOps workflows." },
        { q: "Shift-left security?", a: "Perform threat modeling, SAST, dependency scanning during development not post-release." },
        { q: "SAST vs DAST?", a: "SAST analyzes source/code paths; DAST tests running app externally for vulnerabilities." },
        { q: "SBOM importance?", a: "Inventory of components (dependencies) aiding vulnerability management & compliance." },
        { q: "Secret scanning necessity?", a: "Detect leaked credentials early preventing exploitation (git history, commits)." },
        { q: "Container image scanning?", a: "Analyze layers for CVEs & misconfigurations before registry push and at deploy time." },
        { q: "Least privilege principle?", a: "Grant minimal rights required reducing lateral movement & impact of compromise." },
        { q: "Runtime security example?", a: "Monitor syscalls (Falco), enforce policies, anomaly detection for container behavior." },
        { q: "Zero Trust concept?", a: "Never implicit trust; continuous verification of identity, device, context for access." },
        { q: "Security as code benefit?", a: "Version-controlled policies & infrastructure enabling review, audit, automation." },
        { q: "Vulnerability severity prioritization?", a: "Use CVSS plus exploit context & asset criticality to triage remediation." },
        { q: "Threat modeling timing?", a: "Early in design to identify attack surfaces and apply mitigations before implementation." },
        { q: "Software supply chain risks?", a: "Dependency compromise, typosquatting, build system intrusion, malicious commits." },
        { q: "Signature verification of artifacts?", a: "Use cosign or in-toto to attest and verify provenance reducing tampering risk." },
        { q: "Policy-as-code tools?", a: "OPA (Rego), HashiCorp Sentinel, Kyverno enforce declarative security policies automatically." },
        { q: "Secrets rotation strategy?", a: "Automate periodic renewal, short TTL tokens, central vault revocation on compromise." },
        { q: "IaC security scanning?", a: "Check Terraform/CloudFormation/K8s manifests for misconfigurations pre-deploy." },
        { q: "Dependency pinning risk mitigation?", a: "Prevents unexpected changes; include periodic update workflow + scanning." },
        { q: "Credential stuffing defense?", a: "Use MFA, rate limiting, anomaly detection, strong password hygiene & breach monitoring." },
        { q: "Security champions program?", a: "Embed trained advocates in dev teams scaling security knowledge & practices." },
        { q: "Runtime policy engine examples?", a: "Falco rules, AppArmor/SELinux, eBPF-based anomaly detection blocking suspicious behavior." },
        { q: "Shift-right security practices?", a: "Continuous runtime monitoring, threat hunting, chaos security tests." },
        { q: "Pen test vs red team?", a: "Pen test scoped vulnerability discovery; red team simulates adversary tactics end-to-end." },
        { q: "Dynamic secrets benefit?", a: "Short-lived credentials reduce impact window if leaked." },
        { q: "Security debt concept?", a: "Accumulated unresolved vulnerabilities/misconfigurations increasing future remediation cost." },
        { q: "Least privilege implementation in K8s?", a: "RBAC minimal roles, network policies, restrict capabilities & volume mounts." },
        { q: "SCA vs SAST difference?", a: "Software Composition Analysis inspects dependencies; SAST analyzes source code logic." },
        { q: "Container escape mitigation?", a: "Drop privileges, seccomp, rootless containers, patch kernel, minimal attack surface." },
        { q: "API security checklist?", a: "Auth, rate limit, input validation, logging, encryption, proper error handling." },
        { q: "Automating secrets revocation?", a: "Trigger on rotation events or compromise detection to invalidate tokens immediately." }
    ],
    "Networking Basics": [
        { q: "What is an IP address?", a: "Numerical label for host/network interface enabling routing and identification." },
        { q: "Difference between TCP and UDP?", a: "TCP reliable, connection-oriented; UDP connectionless, lower latency, possible loss." },
        { q: "Explain DNS lookup steps.", a: "Query resolver -> root -> TLD -> authoritative server returns record." },
        { q: "CIDR notation meaning?", a: "Address/mask representation (e.g., /24 = 255.255.255.0 giving 256 addresses)." },
        { q: "What is NAT?", a: "Translates private IPs to public enabling address conservation & security boundary." },
        { q: "Load balancer purpose?", a: "Distribute traffic across multiple backends improving availability & performance." },
        { q: "Latency vs throughput?", a: "Latency = time delay; throughput = volume of data per time unit." },
        { q: "SSL/TLS handshake overview?", a: "ClientHello, server cert + key exchange, session keys established for encrypted data." },
        { q: "What is MTU?", a: "Maximum Transmission Unit – largest packet size; mismatches can cause fragmentation." },
        { q: "Traceroute function?", a: "Shows path hops by sending packets with increasing TTL capturing intermediate routers." },
        { q: "OSI vs TCP/IP model?", a: "OSI 7-layer conceptual; TCP/IP pragmatic 4/5-layer used in real networking stacks." },
        { q: "What is ARP?", a: "Protocol resolving IP addresses to MAC addresses on local network segments." },
        { q: "Difference between hub, switch, router?", a: "Hub broadcasts, switch frames to MAC, router routes packets between networks." },
        { q: "IPv4 vs IPv6 key differences?", a: "Address length, autoconfiguration (SLAAC), no NAT requirement, improved header and extension support." },
        { q: "What is BGP?", a: "Path vector routing protocol exchanging reachability among autonomous systems (internet)." },
        { q: "DNS record types common?", a: "A, AAAA, CNAME, MX, TXT, SRV, NS, PTR, SOA each serving distinct resolution roles." },
        { q: "Difference between symmetric and asymmetric encryption?", a: "Symmetric single shared key; asymmetric public/private key pair operations." },
        { q: "What is QoS?", a: "Quality of Service prioritizes specific traffic classes ensuring performance under congestion." },
        { q: "TCP three-way handshake?", a: "SYN, SYN-ACK, ACK establishes connection parameters." },
        { q: "What is DHCP?", a: "Dynamic Host Configuration Protocol automatically assigns IP, gateway, DNS to clients." },
        { q: "Firewall stateful vs stateless?", a: "Stateful tracks connection context; stateless evaluates packets individually." },
        { q: "Explain CDN edge caching?", a: "Distribute content closer to users reducing latency leveraging intermediate caches." },
        { q: "Packet vs frame?", a: "Frame is data link layer unit; packet is network layer containing IP header and payload." },
        { q: "What is latency jitter?", a: "Variance in packet delay affecting real-time streaming quality." },
        { q: "Load balancer sticky sessions?", a: "Persist user to same backend improving session state handling via cookie or source IP." },
        { q: "What is reverse proxy?", a: "Server intercepting client requests to backend services providing routing, caching, security." },
        { q: "Explain port forwarding?", a: "Mapping external port to internal address/service enabling access behind NAT." },
        { q: "WebSocket vs HTTP?", a: "WebSocket persistent bidirectional channel; HTTP request/response stateless pattern." },
        { q: "TLS certificate chain components?", a: "Leaf cert, intermediate CAs, root CA establishing trust path." }
    ],
    "System Design Basics": [
        { q: "Horizontal vs vertical scaling?", a: "Horizontal adds machines; vertical adds resources to existing machine." },
        { q: "What is a cache?", a: "Fast storage layer (memory) holding frequently accessed data reducing latency & load." },
        { q: "CAP theorem summary?", a: "Distributed systems can only fully provide two of Consistency, Availability, Partition Tolerance." },
        { q: "Load balancer roles?", a: "Distribute traffic, health checking, SSL termination, sometimes session persistence." },
        { q: "Database sharding?", a: "Partition data across servers based on key for scalability & throughput." },
        { q: "Message queue benefits?", a: "Decoupling, buffering, async communication, resilience under spike load." },
        { q: "CDN purpose?", a: "Edge caching static (and sometimes dynamic) content reducing latency globally." },
        { q: "Idempotent API meaning?", a: "Multiple identical requests yield same result (safe retries)." },
        { q: "Read vs write replicas?", a: "Read replicas offload query traffic; writes occur on primary ensuring consistency." },
        { q: "Design for high availability?", a: "Redundancy, failover, health checks, stateless components, multi-zone deployment." },
        { q: "Event-driven architecture benefit?", a: "Loose coupling, scalability, asynchronous processing improving resilience." },
        { q: "CQRS pattern?", a: "Separate read/query model from write/command model optimizing for different workloads." },
        { q: "Write amplification mitigation?", a: "Use batching, log-structured storage, compression to reduce I/O cost." },
        { q: "Distributed locking approach?", a: "Use Redis Redlock, Zookeeper, or database advisory locks for coordination." },
        { q: "Cache invalidation strategies?", a: "Time-based TTL, write-through, write-back, explicit eviction on data change." },
        { q: "Rate limiting algorithms?", a: "Token bucket, leaky bucket, fixed window, sliding window for controlling request flow." },
        { q: "Design for eventual consistency?", a: "Accept temporary divergence with converging reconciliation using versioning and conflict resolution." },
        { q: "Microservices pros?", a: "Independent deploy, scaling, technology heterogeneity; cons: complexity, latency, observability challenges." },
        { q: "Hot vs cold storage?", a: "Hot frequently accessed low-latency; cold archival low-cost higher latency retrieval." },
        { q: "Circuit breaker pattern?", a: "Detect failing calls and short-circuit to prevent cascading failures and allow recovery." },
        { q: "Backpressure handling?", a: "Queue limits, shed load, adaptive throttling to maintain stability under overload." },
        { q: "Distributed tracing need?", a: "Correlate requests across services pinpoint latency and faults." },
        { q: "Id generation strategies?", a: "UUID, snowflake, database sequences, ULID balancing uniqueness & sortability." },
        { q: "Consistent hashing use-case?", a: "Minimize key remapping on node changes in distributed caches/storage." },
        { q: "Data partitioning pitfalls?", a: "Skew causing hotspots, cross-partition joins complexity, rebalancing challenges." },
        { q: "Saga pattern purpose?", a: "Coordinate distributed transactions via compensating actions maintaining eventual consistency." },
        { q: "Latency optimization techniques?", a: "Edge caching, connection pooling, async I/O, parallelism, compression." },
        { q: "Database indexing trade-off?", a: "Improves read speed but adds write overhead and storage usage." },
        { q: "Denormalization benefit?", a: "Optimize read performance by duplicating data reducing joins at cost of complexity." },
        { q: "Blue/green for DB migrations?", a: "Use forward-compatible schema changes enabling both versions to operate during switch." }
    ],
    "Shell Scripting": [
        { q: "Difference between single and double quotes?", a: "Single preserves literal value; double allows variable and command substitution." },
        { q: "What is set -e?", a: "Exit script immediately if any command returns non-zero (with caveats)." },
        { q: "Command substitution forms?", a: "$(command) preferred modern; legacy backticks `command`." },
        { q: "How to loop over files?", a: "for f in *.txt; do echo \"$f\"; done" },
        { q: "Difference between [ ] and [[ ]]?", a: "[[ ]] is bash test with extended pattern matching & fewer quoting issues." },
        { q: "Purpose of shebang?", a: "First line #!/bin/bash indicates interpreter to execute script." },
        { q: "Here document example?", a: "cat <<EOF\ncontent\nEOF used to pass multiline strings." },
        { q: "Exit status checking?", a: "Use if command; then ... or inspect $? immediately after command." },
        { q: "xargs use-case?", a: "Build and execute command lines from stdin (efficient batch processing)." },
        { q: "Difference between function and sourcing?", a: "Function defined inside script; sourcing (. file) executes in current shell environment sharing vars." },
        { q: "What is set -u?", a: "Treat unset variables as errors improving script robustness." },
        { q: "Purpose of set -o pipefail?", a: "Return non-zero if any command in pipeline fails catching hidden errors." },
        { q: "Array declaration syntax?", a: "arr=(one two); access via ${arr[0]} length ${#arr[@]}." },
        { q: "Parameter expansion example?", a: "${VAR:-default} uses fallback if VAR unset or empty." },
        { q: "Trap usage?", a: "trap 'cleanup' EXIT handles resource release on script termination." },
        { q: "Subshell vs current shell?", a: "Parentheses ( ) spawn subshell; changes not persisted in parent environment." },
        { q: "Command group braces { }?", a: "Run commands in current shell allowing redirection on group output." },
        { q: "Difference between > and >>?", a: "> truncates file before writing; >> appends to existing content." },
        { q: "Process substitution?", a: "Diff two outputs: diff <(cmd1) <(cmd2) feeding temporary FIFOs." },
        { q: "Select construct usage?", a: "Create simple interactive menus looping over options until break." },
        { q: "[[ -z $var ]] test meaning?", a: "True if variable is unset or empty string." },
        { q: "Efficient file line reading?", a: "while IFS= read -r line; do ... done < file preserves spacing." },
        { q: "Export vs local variable?", a: "export passes to child processes; local limits scope within function." },
        { q: "Shebang portability tip?", a: "Use #!/usr/bin/env bash to locate interpreter via PATH across systems." },
    { q: "Here string usage?", a: "cmd <<< \"input\" feeds short string as stdin." },
        { q: "Check if command exists?", a: "command -v tool >/dev/null 2>&1 or type tool." },
        { q: "Globbing vs regex?", a: "Shell glob expands filenames; regex used in tools like grep/sed/awk not for expansion." },
        { q: "Secure temp file creation?", a: "Use mktemp to avoid race conditions with predictable filenames." },
        { q: "Arithmetic expansion?", a: "$(( expression )) performs integer math." },
        { q: "Why quote variables?", a: "Prevents word splitting and globbing preserving intended argument grouping." }
    ]
    ,
    "Quiz Practice": [
        { q: "Blue/Green vs Canary deployment difference?", options: ["Both shift all traffic instantly","Blue/Green swaps full env; canary gradual","Canary replaces full env instantly","Neither impacts risk"], correct: 1 },
        { q: "Primary benefit of infrastructure as code?", options: ["Higher manual change rate","Unversioned quick edits","Repeatable version-controlled provisioning","Eliminates need for documentation"], correct: 2 },
        { q: "Immutable image benefit?", options: ["Allows mutating running containers","Simplifies rollback & audit","Requires SSH access for patching","Reduces build determinism"], correct: 1 },
        { q: "Vertical vs horizontal pod autoscaling?", options: ["Vertical adds replicas","Horizontal changes CPU requests only","Vertical adjusts resources; horizontal replica count","Both identical"], correct: 2 },
        { q: "Service mesh main value?", options: ["Manual TLS config","Uniform traffic mgmt & mTLS without code changes","Replaces CI/CD","Eliminates need for monitoring"], correct: 1 },
        { q: "Secret handling best practice?", options: ["Commit to repo encrypted","Store plain in logs","Inject at runtime from vault","Email to team"], correct: 2 },
        { q: "Feature flags purpose?", options: ["Couple deploy & release","Instant disable of features","Increase rollback complexity","Force full traffic shift"], correct: 1 },
        { q: "Rolling update advantage?", options: ["Zero monitoring needed","Gradual replacement reduces risk","Requires full downtime","Prevents canaries"], correct: 1 },
        { q: "Metric vs log vs trace?", options: ["Metric numeric TS; log events; trace request spans","All store raw event text","Trace is a log file","Metrics hold full request bodies"], correct: 0 },
        { q: "Readiness probe purpose?", options: ["Restart crashed container","Hold traffic until ready","Update image registry","Scale deployment"], correct: 1 },
        { q: "StatefulSet vs Deployment?", options: ["Deployment gives stable IDs","StatefulSet ordered & stable identity","Both ensure unique hostnames","StatefulSet only for stateless apps"], correct: 1 },
        { q: "Terraform plan value?", options: ["Directly applies changes","Shows proposed diff for review","Deletes state file","Encrypts secrets"], correct: 1 },
        { q: "Git rebase typical use?", options: ["Rewrite linear history","Create merge commits","Discard local changes","Tag releases"], correct: 0 },
        { q: "Optimize Docker layer caching by?", options: ["Randomizing instruction order","Grouping frequent-change late","Installing deps early & stable","Removing .dockerignore"], correct: 2 },
        { q: "MTTR measures?", options: ["Time between failures","Average restore time after incident","Deploy frequency","Regression severity"], correct: 1 },
        { q: "High label cardinality impact?", options: ["Improves query speed","Inflates memory & slows queries","Reduces storage usage","Simplifies dashboards"], correct: 1 },
        { q: "Multi-stage build goal?", options: ["Increase image size","Reuse build artifacts for smaller final","Merge unrelated images","Avoid caching"], correct: 1 },
        { q: "Git tag purpose?", options: ["Delete branches","Mark commit for release/milestone","Store credentials","Overwrite history"], correct: 1 },
        { q: "Infrastructure drift means?", options: ["Code equals prod","Prod diverges from IaC state","No manual changes ever","Version pinning success"], correct: 1 },
        { q: "Circuit breaker goal?", options: ["Increase failing calls","Prevent cascading failures","Disable retries","Slow healthy services"], correct: 1 },
        { q: "Error budget usage?", options: ["Increase downtime unknown","Balance reliability & release speed","Measure CPU only","Replace SLIs"], correct: 1 },
        { q: "Pin dependencies to?", options: ["Break reproducibility","Ensure deterministic builds","Force latest always","Reduce auditability"], correct: 1 },
        { q: "ConfigMap vs Secret?", options: ["Secret for sensitive data (encoded); ConfigMap general config","Both encrypted","ConfigMap only for passwords","Secret only for logs"], correct: 0 },
        { q: "Idempotent API benefit?", options: ["Duplicate side effects","Safe retries yield same result","Prevents caching","Requires sessions"], correct: 1 },
        { q: "Chaos engineering objective?", options: ["Hide weaknesses","Reveal weaknesses pre-incident","Remove monitoring","Increase MTTR"], correct: 1 },
        { q: "DORA metrics include?", options: ["CPU, memory","Deploy freq, lead time, MTTR, change fail rate","Latency, throughput, jitter","Revenue, churn, shares"], correct: 1 },
        { q: "SLI example?", options: ["Developer happiness","p95 latency","Story points velocity","Repo size"], correct: 1 },
        { q: "Ansible handler triggered by?", options: ["notify from changed task","Every task","Inventory order","SSH keepalive"], correct: 0 },
        { q: "ENTRYPOINT + CMD pattern?", options: ["CMD sets executable, ENTRYPOINT args","ENTRYPOINT binary, CMD default args","Both ignore args","Neither used together"], correct: 1 },
        { q: "Failed DB migration rollback?", options: ["Ignore errors","Apply compensating or restore backup","Change table randomly","Disable backups"], correct: 1 },
        { q: "Canary vs A/B test difference?", options: ["Canary reliability; A/B user behavior","Both identical","A/B only latency","Canary replaces metrics"], correct: 0 },
        { q: "Message queue advantage?", options: ["Tight coupling","Decoupled async buffering","Higher latency required","Eliminates scaling"], correct: 1 },
        { q: "Git cherry-pick does?", options: ["Applies single commit onto current HEAD","Deletes history","Pushes tags","Creates branch"], correct: 0 },
        { q: "Terraform remote state backend benefit?", options: ["Loss of locking","Central locking & collaboration","Slower plans always","Removes versioning"], correct: 1 },
        { q: "Horizontal scaling challenge?", options: ["Simpler consistency","Coordination & data consistency complexity","Reduced latency always","Less redundancy"], correct: 1 },
        { q: "Kubernetes RBAC goal?", options: ["Give all access","Granular API permissions","Remove auth","Enable root login"], correct: 1 },
        { q: "Liveness vs readiness probe?", options: ["Both restart","Liveness restart; readiness gate traffic","Readiness restarts; liveness gates","Neither important"], correct: 1 },
        { q: "Secret scanning pipeline value?", options: ["Slow builds","Early credential leak detection","Removes encryption","Increases drift"], correct: 1 },
        { q: "Declarative infra advantage?", options: ["Harder drift detection","Simpler convergence & auditing","Manual change reliance","Unpredictable state"], correct: 1 },
        { q: "Blue/Green quick rollback?", options: ["Redeploy all artifacts","Switch traffic back to previous env","Rewrite code","Drop database"], correct: 1 },
        { q: "Rate limiting purpose?", options: ["Increase overload","Protect service from abuse","Remove authentication","Slow healthy traffic"], correct: 1 },
        { q: "Edge caching reduces latency by?", options: ["Adding hops","Serving content near users","Encrypting headers","Removing DNS"], correct: 1 },
        { q: "Observability pillars?", options: ["Logs, metrics, traces","CPU, memory, disk","Latency, jitter, MTU","Events only"], correct: 0 },
        { q: "Git squash benefit?", options: ["No effect on history readability","Consolidates commits for clarity","Deletes tags","Increases conflicts"], correct: 1 },
        { q: "Mutable resource risk?", options: ["Safe rollbacks","In-place change may disrupt service","Faster audit","Immutable identical"], correct: 1 },
        { q: "LB health checks help by?", options: ["Ignoring failures","Removing unhealthy instances automatically","Restarting healthy ones","Disabling scaling"], correct: 1 },
        { q: "Monolith vs microservices?", options: ["Monolith distributed; microservices single unit","Monolith single deploy unit; microservices independent services","Both identical","Microservices cannot scale"], correct: 1 },
        { q: "Shadow traffic testing purpose?", options: ["Impact real users","Replay prod requests to new version safely","Eliminate monitoring","Replace staging"], correct: 1 },
        { q: "Fork vs branch scenario?", options: ["Fork external contributions; branch internal","Branch external; fork internal","Both same","Fork deletes history"], correct: 0 },
        { q: "K8s Service discovery?", options: ["Static IP manual","CoreDNS provides service name resolution","Etcd direct queries","Ingress only"], correct: 1 },
        { q: "Load average meaning?", options: ["FTP connections count","Runnable + uninterruptible tasks over intervals","Only CPU MHz","Swap usage"], correct: 1 },
        { q: "Container scanning value?", options: ["Increase attack surface","Identify vulnerable layers early","Remove OS packages","Bypass CVE tracking"], correct: 1 }
    ]
    ,
    "Quiz2": [
        { q: "Identify this platform logo", image: "images/docker.svg", alt: "Blue rectangle with text Docker", options: ["Docker","Kubernetes","Helm","Git"], correct: 0 },
        { q: "Identify this orchestration logo", image: "images/kubernetes.svg", alt: "Blue rectangle with text K8s", options: ["Terraform","Kubernetes","Istio","Consul"], correct: 1 },
        { q: "Identify this IaC tool", image: "images/terraform.svg", alt: "Purple rectangle with text Terraform", options: ["Terraform","Ansible","SaltStack","Vault"], correct: 0 },
        { q: "Identify this automation server", image: "images/jenkins.svg", alt: "Red rectangle with text Jenkins", options: ["Jenkins","GitLab","GitHub","ArgoCD"], correct: 0 },
        { q: "Identify this VCS tool", image: "images/git.svg", alt: "Orange rectangle with text Git", options: ["Git","GitHub","GitLab","Jenkins"], correct: 0 },
        { q: "Identify this hosting service", image: "images/github.svg", alt: "Dark rectangle with text GitHub", options: ["Git","GitLab","GitHub","Bitbucket"], correct: 2 },
        { q: "Identify this monitoring system", image: "images/prometheus.svg", alt: "Orange rectangle with text Prometheus", options: ["Prometheus","Grafana","Consul","Vault"], correct: 0 },
        { q: "Identify this visualization tool", image: "images/grafana.svg", alt: "Orange rectangle with text Grafana", options: ["Grafana","Prometheus","Kibana","Loki"], correct: 0 },
        { q: "Identify this automation tool", image: "images/ansible.svg", alt: "Black rectangle with text Ansible", options: ["SaltStack","Ansible","Terraform","Helm"], correct: 1 },
        { q: "Identify this configuration tool", image: "images/saltstack.svg", alt: "Blue rectangle with text SaltStack", options: ["Ansible","SaltStack","Chef","Puppet"], correct: 1 },
        { q: "Identify this packaging tool", image: "images/helm.svg", alt: "Blue rectangle with text Helm", options: ["Helm","Kustomize","Docker","Istio"], correct: 0 },
        { q: "Identify this cloud provider", image: "images/aws.svg", alt: "Dark rectangle with text AWS", options: ["AWS","Azure","GCP","Oracle Cloud"], correct: 0 },
        { q: "Identify this cloud provider", image: "images/azure.svg", alt: "Blue rectangle with text Azure", options: ["AWS","GCP","Azure","DigitalOcean"], correct: 2 },
        { q: "Identify this cloud provider", image: "images/gcp.svg", alt: "Blue rectangle with text GCP", options: ["GCP","AWS","Azure","OpenStack"], correct: 0 },
        { q: "Identify this OS mascot", image: "images/linux.svg", alt: "Dark rectangle with text Linux", options: ["Windows","Linux","BSD","Solaris"], correct: 1 },
        { q: "Identify this DevOps platform", image: "images/gitlab.svg", alt: "Orange rectangle with text GitLab", options: ["GitHub","GitLab","Bitbucket","Jenkins"], correct: 1 },
        { q: "Identify this CD tool", image: "images/argocd.svg", alt: "Orange rectangle with text ArgoCD", options: ["ArgoCD","Jenkins","Spinnaker","Tekton"], correct: 0 },
        { q: "Identify this service mesh", image: "images/istio.svg", alt: "Blue rectangle with text Istio", options: ["Istio","Linkerd","Envoy","Consul"], correct: 0 },
        { q: "Identify this secrets manager", image: "images/vault.svg", alt: "Black rectangle with text Vault", options: ["Vault","Consul","Keycloak","Etcd"], correct: 0 },
        { q: "Identify this service discovery tool", image: "images/consul.svg", alt: "Purple rectangle with text Consul", options: ["Consul","Vault","Etcd","ZooKeeper"], correct: 0 }
    ]
    ,
    "Quiz3": [
        { q: "Tool for container orchestration?", options: ["Terraform","Kubernetes","Git","Ansible"], correct: 1 },
        { q: "Immutable build artifact advantage?", options: ["Harder rollback","Predictable deployments","Allows live patch mutation","Increases config drift"], correct: 1 },
        { q: "Service mesh common feature?", options: ["Kernel patching","mTLS and traffic policies","Container registry","Disk encryption"], correct: 1 },
        { q: "Git command to apply single commit from another branch?", options: ["git rebase","git cherry-pick","git stash","git fetch"], correct: 1 },
        { q: "Terraform plan purpose?", options: ["Immediately applies changes","Shows proposed diff","Encrypts state","Lists remote backends"], correct: 1 },
        { q: "Prometheus label cardinality risk?", options: ["Lower memory","Higher memory & slow queries","No impact","Improved indexing"], correct: 1 },
        { q: "Blue/Green deployment quick rollback?", options: ["Scale to zero","Switch traffic back","Delete DB","Patch binaries live"], correct: 1 },
        { q: "SRE error budget balances?", options: ["Cost & revenue","Reliability & release velocity","CPU & memory","Ops & HR"], correct: 1 },
        { q: "Container image size reduction technique?", options: ["Add debug tools","Multi-stage builds","Random layer order","Use large base image"], correct: 1 },
        { q: "Kubernetes readiness probe function?", options: ["Restart container","Gate traffic until ready","Build image","Scale cluster"], correct: 1 },
        { q: "Tool primarily for declarative infra provisioning?", options: ["Terraform","Grafana","Prometheus","Helm"], correct: 0 },
        { q: "Command to view running process I/O stats?", options: ["iostat","vmstat","pidstat","ls"], correct: 2 },
        { q: "Git revert vs reset safety?", options: ["Revert preserves history","Reset always safe","Both rewrite remote tags","Neither changes history"], correct: 0 },
        { q: "Why use feature flags?", options: ["Force large bang deploys","Gradual release & fast disable","Increase coupling","Remove test env"], correct: 1 },
        { q: "Message queue primary benefit?", options: ["Tight coupling","Async decoupling","Higher latency required","Removes retries"], correct: 1 },
        { q: "ConfigMap use case?", options: ["Store passwords","General application config","Binary build steps","Kernel modules"], correct: 1 },
        { q: "Docker ENTRYPOINT specifies?", options: ["Default args","Executable to run","Working directory","Image tag"], correct: 1 },
        { q: "Observability three pillars?", options: ["SSH, SFTP, SCP","Logs, Metrics, Traces","HTML, CSS, JS","CPU, Memory, Disk"], correct: 1 },
        { q: "Least privilege reduces?", options: ["Attack surface","Logging quality","Code coverage","Caching"], correct: 0 },
        { q: "Kubernetes Service discovery via?", options: ["Static file","CoreDNS","Kernel panic","Git hooks"], correct: 1 }
    ]
    ,
    "Quiz4": [
        { q: "Terraform language file extension?", options: [".tf",".tfm",".tvars",".hclx"], correct: 0 },
        { q: "terraform init purpose?", options: ["Run plan","Install providers & modules","Apply resources","Format code"], correct: 1 },
        { q: "terraform plan safety benefit?", options: ["Applies changes immediately","Previews execution changes","Generates backend credentials","Locks state forever"], correct: 1 },
        { q: "State locking prevents?", options: ["Parallel conflicting applies","Provider downloads","Variable interpolation","Module caching"], correct: 0 },
        { q: "Remote backend advantage?", options: ["Local-only state","No collaboration","Centralized locking & sharing","Removes need for plan"], correct: 2 },
        { q: "Workspace usage?", options: ["Multiple environment states","Module version pinning","Provider authentication","Secret rotation"], correct: 0 },
        { q: "Count vs for_each difference?", options: ["count for maps; for_each only numbers","count indexes list; for_each iterates map/set","Both identical","for_each only for modules"], correct: 1 },
        { q: "Dynamic block purpose?", options: ["Render repeated nested blocks","Encrypt variables","Create provider alias","Import resources"], correct: 0 },
        { q: "Data source usage?", options: ["Define resources","Read external existing data","Taint resources","Destroy modules"], correct: 1 },
        { q: "Output values helpful for?", options: ["Plan failure","Expose computed info to users & modules","Locking state","Destroy sequence"], correct: 1 },
        { q: "Variable precedence highest?", options: ["Default in code","Environment TF_VAR_*","CLI -var or -var-file","None of these"], correct: 2 },
        { q: "terraform refresh effect?", options: ["Updates state to match real infra","Destroys all drift","Skips remote data","Renames resources"], correct: 0 },
        { q: "Resource taint result?", options: ["Skip apply","Force recreation next apply","Destroy immediately","Lock state"], correct: 1 },
        { q: "Import command purpose?", options: ["Pull remote object into state","Delete state file","Format configuration","Upgrade providers"], correct: 0 },
        { q: "Module source examples?", options: ["Git URL, registry slug, local path","Only local path","Only registry","Docker image"], correct: 0 },
        { q: "Provider version pinning syntax?", options: ["version { }","required_providers block","provider_lock file","terraform.lock override"], correct: 1 },
        { q: "Lifecycle create_before_destroy use?", options: ["Ignore dependencies","Ensure replacement built prior deletion","Skip provisioners","Force taint"], correct: 1 },
        { q: "depends_on needed when?", options: ["Implicit references exist","No direct attribute reference but ordering required","Always for modules","Never needed"], correct: 1 },
        { q: "Terraform Cloud benefits?", options: ["Central runs, policy enforcement","Local only state","Removes need for state locking","Replaces all providers"], correct: 0 },
        { q: "Sensitive variable flag effect?", options: ["Blocks plan","Redacts in output","Encrypts backend automatically","Turns into data source"], correct: 1 }
    ]
    ,
    "Quiz5": [
        { q: "VPC peering vs Transit Gateway primary difference?", options: ["Peering scales transitive routing","TGW enables centralized transitive routing","Peering supports multicast","TGW only for IPv6"], correct: 1 },
        { q: "Gateway vs Interface VPC Endpoint core distinction?", options: ["Gateway for S3/DynamoDB; Interface for other services via ENI","Interface endpoints only public","Gateway endpoints cost hourly","No difference"], correct: 0 },
        { q: "PrivateLink benefit over VPC peering for service exposure?", options: ["Transitive routing","Exposes only specific service via interface endpoint","Shares entire CIDR","Allows IPv4 to IPv6 translation"], correct: 1 },
        { q: "Security Group vs NACL evaluation model?", options: ["SG stateless / NACL stateful","SG stateful / NACL stateless ordered rules","Both stateless","Both stateful unordered"], correct: 1 },
        { q: "Best method to centralize DNS resolution across multi-account architecture?", options: ["Public hosted zone sharing","Route 53 Resolver inbound/outbound endpoints + shared rules","Create many private zones with same name","Split-horizon via ALB"], correct: 1 },
        { q: "AWS Global Accelerator vs CloudFront latency edge case?", options: ["Global Accelerator accelerates non-HTTP & preserves client IP","CloudFront only for DynamoDB","Neither supports TCP","CloudFront preserves IP always"], correct: 0 },
        { q: "Transit Gateway route propagation control purpose?", options: ["Reduce BGP CPU","Selective attachment route visibility for segmentation","Enable multicast only","Force static routing"], correct: 1 },
        { q: "Egress-only Internet Gateway usage?", options: ["Outbound-only for IPv6 instances preventing unsolicited inbound","Cost-saving for NAT","For IPv4 only","Replace NAT Gateway entirely"], correct: 0 },
        { q: "Flow Logs capture limitation?", options: ["Cannot capture denied traffic","No packet payloads; metadata only","Works only at ENI level","No multi-region support"], correct: 1 },
        { q: "Traffic Mirroring typical use?", options: ["Latency reduction","Deep packet inspection & IDS analysis","Cost optimization for NAT","DNS acceleration"], correct: 1 },
        { q: "Reduce NAT Gateway data processing charges strategy?", options: ["Consolidate all outbound through one region","Place private resources in same AZ as NAT or use private endpoints","Force IPv6 everywhere","Use more NAT Gateways than needed"], correct: 1 },
        { q: "ALB vs NLB selection criterion for high-throughput TCP?", options: ["Use ALB for millions of packets raw","NLB for ultra-low latency L4 + static IP","ALB supports UDP natively","NLB required for WebSockets only"], correct: 1 },
        { q: "When prefer Gateway Load Balancer?", options: ["HTTP static content","Inline third-party appliances (firewall/IDS) insertion","Simple TLS termination","Long polling only"], correct: 1 },
        { q: "Centralized inspection pattern across accounts?", options: ["Route all traffic via CloudFront","VPC routing to GWLB + Transit Gateway attachments","Enable SSH bastions everywhere","Disable SGs use NACL only"], correct: 1 },
        { q: "IPv4 exhaustion mitigation inside AWS?", options: ["Allocate more /16 always","Adopt IPv6, use PrivateLink/endpoints to reduce public need, NAT reuse","Disable VPC","Use public IP for each pod"], correct: 1 },
        { q: "Difference between Route 53 weighted vs latency policy?", options: ["Weighted splits traffic by geo","Latency directs to region with lowest RTT while weighted defines percentages","Latency ignores health checks","Weighted auto-adjusts on health"], correct: 1 },
        { q: "Hybrid connectivity lowest latency and predictable bandwidth?", options: ["Site-to-site VPN","Direct Connect (optionally + VPN for failover)","Snowball Edge","S3 Transfer Acceleration"], correct: 1 },
        { q: "Transit Gateway vs VPC peering cost/scale advantage?", options: ["Peering supports thousands of transitive routes","TGW reduces full-mesh complexity with central hub","TGW limited to 2 attachments","Peering offers multicast natively"], correct: 1 },
        { q: "NACL rule evaluation order?", options: ["Random order","Numerical ascending until match then stop","Descending then fallback","All evaluated then majority vote"], correct: 1 },
        { q: "Security Group ephemeral port return traffic handling?", options: ["Explicit inbound rule required","Stateful tracking allows return without inbound rule","Return blocked always","NACL must allow ephemeral only"], correct: 1 },
        { q: "Route 53 Resolver outbound endpoint function?", options: ["Forward queries to on-prem DNS for private zone resolution","Block DNS exfiltration","Provide DNSSEC only","Accelerate HTTP"], correct: 0 },
        { q: "Central egress VPC design risk?", options: ["Simplifies blast radius","Potential single-point performance bottleneck & complexity","Eliminates NAT charges","Removes need for logging"], correct: 1 },
        { q: "AWS Network Firewall placement?", options: ["Inside public subnet only","In dedicated firewall subnets referenced by route tables for traffic inspection","Attached to ALB directly","Replaces Security Groups"], correct: 1 },
        { q: "Improving inter-AZ latency for chat application?", options: ["Disable cross-zone LB","Use Global Accelerator + region selection + keep connections warm","Move all instances to one AZ sacrificing HA","Reduce MTU arbitrarily"], correct: 1 },
        { q: "Container networking mode giving each task an ENI?", options: ["Bridge","awsvpc (ECS Fargate/EC2 tasks)","Host","Overlay"], correct: 1 },
        { q: "Kubernetes CNI for native VPC ENI attachment?", options: ["Weave","Amazon VPC CNI","Flannel","Calico only"], correct: 1 },
        { q: "Global Accelerator preserves which client attribute beneficial for security?", options: ["TLS session tickets","Source IP at origin","Browser cookies","SSH keys"], correct: 1 },
        { q: "Latency-based routing health check requirement?", options: ["Not required","Health checks ensure unhealthy region excluded","Only weighted uses health","Health makes DNS round robin"], correct: 1 },
        { q: "VPC endpoint for S3 reduces what?", options: ["Public internet path exposure for private subnets accessing S3","S3 object size","IAM policy complexity","Encryption overhead"], correct: 0 },
        { q: "Transit Gateway multi-region design for DR?", options: ["Always single region","Peer TGWs via inter-region peering for cross-region connectivity","Requires CloudFront","Replace with NAT Gateway"], correct: 1 }
    ]
    ,
    "Quiz6": [
        { q: "Mandatory Chart.yaml fields for a valid chart?", options: ["apiVersion and type","name and version (plus apiVersion)","description only","appVersion only"], correct: 1 },
        { q: "Difference between appVersion vs version in Chart.yaml?", options: ["Both identical","version is chart package version; appVersion is underlying app version","appVersion used for dependency locks","version unused"], correct: 1 },
        { q: "Values precedence highest of these methods?", options: ["values.yaml","-f file overrides","--set on CLI","Library chart defaults"], correct: 2 },
        { q: "Template helper reuse file?", options: ["_helpers.tpl","helpers.yaml","common.tpl","macros.txt"], correct: 0 },
        { q: "Library chart purpose?", options: ["Contains only docs","Reusable template helpers without manifests","Executes post-render scripts","Stores CRDs only"], correct: 1 },
        { q: "helm dependency update does?", options: ["Installs runtime container","Vendors subchart archives to charts/","Validates values schema","Runs tests"], correct: 1 },
        { q: "Dependency version pin form?", options: ["name@tag","semver constraint in Chart.yaml dependencies","values.yaml entry","helm lock file editing"], correct: 1 },
        { q: "Global values usage?", options: ["Override Kubernetes cluster config","Shared keys accessible from subcharts via .Values.global","Disable hooks","Force atomic upgrades"], correct: 1 },
        { q: "safeTpl vs include difference?", options: ["safeTpl escapes HTML","include renders named template with context","Both identical","include strips whitespace only"], correct: 1 },
        { q: "Hook weight smaller number runs?", options: ["Later","Earlier","Random","Only on uninstall"], correct: 1 },
        { q: "--atomic flag effect on upgrade?", options: ["Skips validation","Rolls back on failure automatically","Removes secrets","Force reinstall always"], correct: 1 },
        { q: "helm pull oci:// behavior?", options: ["Downloads & untars chart locally","Pushes chart","Deletes chart","Validates cluster"], correct: 0 },
        { q: "Chart validation of provided values via?", options: ["values.schema.json JSON schema","lint only","NOTES.txt parsing","Kubernetes admission"], correct: 0 },
        { q: "Strategy to avoid CRD deletion on uninstall?", options: ["Place CRDs in templates","Use crds/ directory outside templates","Annotate with keep-crd","helm ignore flag"], correct: 1 },
        { q: "common patterns for rendering list of containers?", options: ["range over .Values.containers","loop containers() builtin","Use helm containers plugin","Impossible"], correct: 0 },
        { q: "Lookup function purpose?", options: ["Query cluster live for existing resources","Encrypt secrets","Compute hash of templates","Enable TLS"], correct: 0 },
        { q: "Condition / tags in dependencies allow?", options: ["Dynamic enable/disable subcharts via values","Changing chart version","Auto scaling","RBAC generation"], correct: 0 },
        { q: "Chart unit testing tool?", options: ["helm unittest plugin","kubetest","chart-kube","helm verify"], correct: 0 },
        { q: "helm diff upgrade value?", options: ["Shows delta of manifests before applying","Runs performance tests","Encrypts secrets","Generates CRDs"], correct: 0 },
        { q: "Best practice for image tag specification?", options: ["Hardcode latest","Parameterize .Values.image.tag with digest","Use random tag each deploy","Store tag in Chart.yaml version"], correct: 1 },
        { q: "Handling deprecated apiVersions across K8s?", options: ["Ignore warnings","Add conditional logic checking .Capabilities.APIVersions","Force kubectl apply first","Remove objects"], correct: 1 },
        { q: "post-renderer usage?", options: ["Mutate rendered manifests before apply","Provide container runtime","Encrypt values","Compile chart"], correct: 0 },
        { q: "Provenance file generated via?", options: ["helm package --sign","helm lint","helm render","helm verify"], correct: 0 },
        { q: "helm verify does?", options: ["Checks signature/provenance integrity","Runs tests","Applies chart","Generates lock file"], correct: 0 },
        { q: "Release name uniqueness scope?", options: ["Cluster-wide","Namespace scoped allowing same name in different namespaces","Per chart only","Global across cloud"], correct: 1 },
    { q: "Template for labels reuse pattern?", options: ["define 'chart.labels' then include","Inline each label","Use yaml anchors only","Forbidden"], correct: 0 },
        { q: "values.yaml environment-specific layering approach?", options: ["Single file only","Multiple -f override files (last wins) per env","Rebuild chart each time","Edit Chart.yaml"], correct: 1 },
        { q: "helm lint checks?", options: ["Chart structure & template issues","Security vulnerabilities","Cluster quota","Pod runtime health"], correct: 0 },
        { q: "Secret encryption at rest handled by?", options: ["Helm native encryption","Kubernetes provider / external tool like SOPS","Chart.yaml flag","--secure-secret"], correct: 1 },
    { q: "Templating to default a value if empty?", options: ["default 'x' .Values.someKey","fallback .Values.someKey 'x'","valueElse","ifDefault"], correct: 0 }
    ],
    "Senior DevOps": [
        { q: "Design a high-availability deployment strategy for a microservices architecture.", a: "Implement multi-region active-active setup with disaster recovery. Use service mesh (Istio) for traffic management, distributed tracing (Jaeger), circuit breakers, and automated failover. Deploy on Kubernetes with PodDisruptionBudgets, replicas across zones, and etcd backup/restore procedures. Use GitOps (Flux/ArgoCD) for infrastructure consistency." },
        { q: "How would you implement blue-green deployments at scale?", a: "Run two identical production environments (blue/green) on separate clusters or namespaces. Route traffic via load balancer/ingress controller to switch between versions instantly. Maintain database migrations separately, use feature flags for gradual rollout, and implement instant rollback via traffic redirect. Monitor both versions simultaneously for anomalies." },
        { q: "Explain strategies for managing configuration drift in production.", a: "Use Infrastructure as Code (Terraform/Helm) as single source of truth. Implement policy-as-code (OPA/Kyverno) to enforce compliance. Audit all changes via Git commits. Use configuration management (Ansible) for compliance checking. Implement continuous validation with drift detection tools and auto-remediation where safe." },
        { q: "Design a CI/CD pipeline for compliance-heavy environments (fintech, healthcare).", a: "Implement multiple stages: security scanning (SAST/DAST), container scanning (Trivy/Grype), policy checks (OPA), approval gates, audit logging of all deployments, cryptographic signing of artifacts, and immutable deployment records. Use separate networks for dev/staging/prod. Implement role-based approval workflows and maintain comprehensive audit trails for regulatory compliance." },
        { q: "How to handle secrets management at enterprise scale?", a: "Use HashiCorp Vault or cloud-native solutions (AWS Secrets Manager, Azure Key Vault). Implement secret rotation policies, audit logging, fine-grained RBAC, and dynamic secrets for databases. Never commit secrets to Git. Use tools like Sealed Secrets or External Secrets Operator for Kubernetes. Implement secret scanning in repos (git-secrets, detect-secrets)." },
        { q: "Design a monitoring and alerting strategy for thousands of microservices.", a: "Use multi-level observability: metrics (Prometheus), logs (ELK/Loki), traces (Jaeger/Tempo). Implement cardinality management to prevent metric explosion. Use alert aggregation with intelligent grouping. Implement SLO/SLI-based alerting instead of threshold-based. Create runbooks for each alert. Use AIOps tools for anomaly detection and correlation analysis." },
        { q: "How would you reduce deployment time from 45 minutes to under 5 minutes?", a: "Profile bottlenecks: identify slow stages. Parallelize jobs (Docker builds, tests). Use caching (layer caching, dependency caching). Implement fast health checks (avoid long-running tests in critical path). Use artifact pre-staging. Optimize image sizes. Implement canary deployments for faster rollback. Use infrastructure closer to build agents to reduce network latency." },
        { q: "Explain canary deployments with metric-based automatic rollback.", a: "Deploy new version to small percentage (5-10%) of traffic. Compare metrics (error rate, latency, resource usage) against baseline using statistical significance testing. If metrics exceed thresholds, automatically rollback. Use service mesh to split traffic and control rollout percentage. Integrate with observability stack to make data-driven decisions automatically." },
        { q: "Design infrastructure for handling millions of requests per second.", a: "Use auto-scaling (HPA/KEDA) with predictive scaling. Implement multi-region load balancing. Use CDN for static assets. Implement caching at multiple layers (Redis, application). Use message queues to decouple services. Optimize database queries and implement read replicas. Use sharding for horizontal scaling. Monitor and adjust resource limits continuously based on traffic patterns." },
        { q: "How to implement GitOps for multi-cluster management?", a: "Use tools like Flux or ArgoCD to sync Git state to multiple clusters. Implement separate repos for different environments/regions. Use Kustomize or Helm for templating. Implement image update automation with tools like Renovate. Track all changes in Git with audit trail. Use cluster-api for cluster provisioning as code. Implement cross-cluster secrets management." },
        { q: "Explain disaster recovery strategy with RTO/RPO targets.", a: "Define RTO (Recovery Time Objective) and RPO (Recovery Point Objective) based on business criticality. Implement regular backup/restore drills. Use automated failover for critical systems. Maintain geographically distributed backups. Implement incremental backups to reduce storage. Test recovery procedures monthly. Use point-in-time recovery for databases. Document recovery procedures with step-by-step runbooks." },
        { q: "Design a strategy to eliminate toil and improve SRE maturity.", a: "Quantify toil activities and their impact. Prioritize automation of repetitive tasks. Implement self-service platforms (PaaS for developers). Use chatops for common operations. Implement automated remediation for known issues. Create runbooks and playbooks for incident response. Build dashboards for visibility. Establish SLOs and track error budgets to guide engineering efforts." },
        { q: "How to handle database schema migrations in production without downtime?", a: "Use backward-compatible migrations: add columns before removing. Deploy application code handling both old/new schemas. Use feature flags to control feature rollout. Implement dual-write during transition period. Test migrations thoroughly in staging. Use online schema change tools (gh-ost, pt-online-schema-change). Monitor for performance impact during migration. Have rollback procedures ready." },
        { q: "Design a strategy for managing Kubernetes at scale (1000+ nodes).", a: "Use cluster federation or multi-cluster management tools. Implement node auto-scaling with cluster autoscaler or Karpenter. Use node pools for different workload types. Implement pod disruption budgets for safe drains. Use network policies for microsegmentation. Implement resource quotas and limits per namespace. Use service mesh for traffic management. Automate cluster upgrades using GitOps." },
        { q: "Explain how to implement effective cost optimization in cloud infrastructure.", a: "Monitor and analyze spend using cloud cost tools (Kubecost, CloudHealth). Right-size resources based on actual usage. Use reserved instances and spot/preemptible VMs. Implement auto-scaling to match demand. Remove unused resources. Use serverless for variable workloads. Negotiate volume discounts. Implement chargeback models to make teams cost-aware. Automate cost anomaly detection." },
        { q: "How would you implement feature flags in production safely?", a: "Use feature flag platforms (LaunchDarkly, Unleash) instead of code branches. Implement targeting rules (user segments, percentages, environments). Track flag changes in audit logs. Monitor impact of feature flags on key metrics. Use canary rollouts with automatic rollback on metric degradation. Document flag lifecycle and cleanup procedures. Integrate flag state with deployment pipeline." },
        { q: "Design an incident response process for high-severity outages.", a: "Establish clear escalation procedures and on-call rotation. Implement automated alerting and paging. Use centralized incident tracking (PagerDuty, Opsgenie). Establish incident commander role. Collect logs/metrics automatically during incidents. Implement runbooks for known issues. Maintain war rooms for cross-functional communication. Conduct blameless post-mortems. Track action items from incidents to prevent recurrence." },
        { q: "How to implement observability-driven development?", a: "Instrument code to emit metrics, logs, and traces. Use OpenTelemetry for standardized instrumentation. Implement structured logging with relevant context. Set up dashboards before features launch. Define SLOs and error budgets. Use tracing to understand service dependencies. Make observability a requirement in code reviews. Train developers on observability best practices." },
        { q: "Explain strategies for managing Kubernetes upgrades across clusters.", a: "Plan upgrades respecting RTO/RPO. Upgrade control plane and nodes in rolling fashion. Test upgrades in non-prod first. Use cluster-api for infrastructure automation. Implement node cordons and graceful pod eviction. Test application compatibility with new k8s version. Maintain downtime budget using PodDisruptionBudgets. Automate rollback if issues detected. Monitor for regressions post-upgrade." },
        { q: "How to design systems that are observable, scalable, and cost-efficient simultaneously?", a: "Balance trade-offs: high observability increases costs, over-scaling wastes resources. Use intelligent auto-scaling (predictive, metric-based). Implement tiered observability (high detail for critical components). Use sampling for high-volume telemetry. Monitor system health via SLOs instead of individual metrics. Automate resource cleanup. Review quarterly to adjust based on actual needs and costs." },
        { q: "Design a strategy for managing data consistency across microservices without transactions.", a: "Implement eventual consistency patterns: event sourcing stores all state changes as immutable events, CQRS separates read/write models. Use saga pattern for distributed transactions (orchestrator or choreography). Implement idempotency keys to handle retries safely. Use event replay for reconciliation. Monitor consistency metrics. Accept temporary inconsistency windows based on business requirements. Use causal ordering where needed." },
        { q: "How to implement security as a first-class concern in infrastructure?", a: "Design zero-trust architecture: authenticate every request, encrypt in-transit and at-rest. Implement least privilege RBAC. Use network policies to restrict traffic. Deploy runtime security tools (Falco). Implement container image scanning and signing. Use policy-as-code (OPA/Kyverno). Audit all access. Implement secrets rotation. Regular vulnerability scanning. Security training for teams. Threat modeling exercises." },
        { q: "Explain how to migrate monolithic application to microservices without downtime.", a: "Start with strangler pattern: extract one service at a time while maintaining monolith. Use anti-corruption layer to translate between old/new systems. Implement dual-write for data consistency during transition. Use feature flags to control traffic routing. Monitor both systems in parallel. Gradual traffic migration to new service. Keep fallback to monolith for months. Test extensively at each step." },
        { q: "Design observability for a distributed system with 100+ services.", a: "Implement distributed tracing (Jaeger/Tempo) to track requests across services. Use service mesh (Istio) to inject tracing automatically. Collect metrics via Prometheus with cardinality limits. Aggregate logs via ELK/Loki. Create cross-service dashboards. Implement SLO monitoring. Use alert correlation to reduce noise. Monitor dependency graph health. Implement latency percentile tracking (p50, p95, p99)." },
        { q: "How to achieve sub-second deployment cycles?", a: "Parallelize stages: build, test, deployment can run concurrently. Implement fast health checks. Use layer caching for Docker builds. Pre-stage artifacts. Use direct artifact push instead of registry for internal deploys. Implement rolling deployments instead of blue-green (faster). Use infrastructure closer to build system. Profile and optimize slowest stages. Consider canary deployments to avoid full validation." },
        { q: "Design a strategy for preventing and recovering from cascading failures.", a: "Implement circuit breakers to stop propagation. Use bulkheads to isolate failures (thread pools, connection pools). Implement timeouts aggressively. Use exponential backoff with jitter. Implement request deduplication. Use fallbacks and graceful degradation. Monitor dependency health continuously. Use synthetic monitoring to catch issues early. Implement chaos testing (Gremlin, Pumba) regularly." },
        { q: "Explain how to implement effective capacity planning for seasonal traffic.", a: "Analyze historical data and trends. Use time-series forecasting (Prophet, ARIMA). Plan for peak + buffer (typically 40-50% headroom). Use auto-scaling with predictive scaling. Pre-provision before known peaks. Use spot instances for variable load. Implement load shedding if needed. Reserve capacity with cloud providers. Monitor utilization constantly. Adjust reservations annually." },
        { q: "How to manage configuration in highly dynamic environments (pets vs cattle)?", a: "Treat infrastructure as cattle (immutable infrastructure). Use infrastructure-as-code for all provisioning. Container images bundled with configuration. Use ConfigMaps/Secrets for runtime config changes. Use GitOps for configuration management. Implement policy enforcement via admission controllers. Avoid SSH into servers (use remote execution). Use service mesh for dynamic routing configuration." },
        { q: "Design a strategy for maintaining developer velocity while ensuring security and compliance.", a: "Shift security left: implement scanning in developer tools (IDE, pre-commit hooks). Use policy-as-code to enforce automatically. Provide self-service onboarding. Automate compliance checking. Create security libraries for common patterns. Regular security training. Fast feedback loop from CI/CD. Use security champions program. Balance speed with safety via error budgets." },
        { q: "Explain how to implement effective load testing and capacity planning.", a: "Use realistic production-like load (user behavior simulation). Test gradually increasing load to find breaking points. Test with sustained load and spikes. Measure not just throughput but latency percentiles. Identify bottlenecks: CPU, memory, disk I/O, network, database. Test chaos scenarios (node failures, network latency). Use tools like k6, JMeter, Gatling. Automate load tests in CI/CD pipeline." },
        { q: "How to handle long-running operations and asynchronous processing at scale?", a: "Use message queues (RabbitMQ, Kafka) to decouple producers from consumers. Implement exponential backoff for retries. Use dead-letter queues for failed messages. Implement idempotency for safe retries. Monitor queue depth and consumer lag. Use stateless workers for horizontal scaling. Implement circuit breakers to prevent cascading failures. Use distributed tracing for debugging." },
        { q: "Design a strategy for managing infrastructure secrets across 50+ services.", a: "Centralize secrets in vault (HashiCorp, cloud-native). Implement automatic rotation with zero-downtime. Use RBAC to limit secret access. Audit all secret access. Implement dynamic secrets generation per request. Use service-to-service authentication (mTLS). Implement secret scanning in repos. Store secrets in tmpfs where possible. Never log secrets. Implement emergency secret revocation procedures." },
        { q: "Explain how to implement effective runbooks for incident response.", a: "Document common issues with step-by-step procedures. Include decision trees for troubleshooting. Automate common recovery steps (restart service, scale out). Link to dashboards and log searches. Version control runbooks alongside infrastructure. Keep runbooks updated as systems change. Test runbooks during drills. Include escalation procedures. Use runbook automation tools (Rundeck, Ansible). Train team on runbooks." },
        { q: "How to design databases for scale without sacrificing consistency where needed?", a: "Use CQRS for read/write separation. Implement read replicas for scalability. Use caching (Redis, Memcached) for hot data. Implement connection pooling. Use database sharding for horizontal scale. For critical data, use multi-master replication with conflict resolution. Implement eventual consistency for non-critical data. Monitor query performance. Use indexes strategically. Consider polyglot persistence (multiple databases for different needs)." },
        { q: "Design a strategy for gradual rollout of infrastructure changes to production.", a: "Use canary deployments: route small percentage to new infrastructure. Monitor health metrics (error rate, latency, resource usage). Compare against baseline using statistical testing. Automate rollback on metric degradation. Use feature flags to control rollout speed. Implement traffic shifting (5%, 25%, 50%, 100%). Use synthetic monitors to detect issues. Maintain rollback capability throughout rollout." },
        { q: "Explain how to implement effective API rate limiting and quota management.", a: "Use token bucket algorithm for smooth rate limiting. Implement per-user, per-IP, and global limits. Use Redis for distributed rate limiting across servers. Return clear rate limit headers (X-RateLimit-*). Implement graceful degradation when limits exceeded. Use adaptive rate limiting based on system load. Monitor rate limit violations for DDoS detection. Provide quota dashboard for users. Implement whitelisting for trusted clients." },
        { q: "How to manage and scale stateful services (databases, caches) in Kubernetes?", a: "Use StatefulSets with persistent volumes. Implement consistent pod identities and ordering. Use headless services for stable DNS names. Implement cluster-aware applications (e.g., RabbitMQ, Redis Cluster). Use operators for lifecycle management. Implement backup strategies for data. Monitor data replication lag. Use anti-affinity rules to spread across nodes. Implement persistent volume snapshots for disaster recovery." },
        { q: "Design a strategy for preventing and handling common production incidents.", a: "Implement monitoring for known failure modes. Create playbooks for common issues. Use chaos engineering to find new failure modes. Implement circuit breakers and bulkheads. Use distributed tracing for diagnosis. Implement automated remediation where safe. Establish clear incident commander and communication procedures. Post-mortem every incident. Track trends and systemic issues. Regular drills and war games." },
        { q: "Explain how to optimize cloud spend while maintaining performance and reliability.", a: "Continuously monitor spend and resource utilization. Right-size resources based on actual usage. Use reserved instances for baseline load. Use spot/preemptible for variable workloads. Implement auto-scaling policies. Remove unused resources automatically. Implement cost allocation tags. Use cloud-native services instead of self-managed. Negotiate volume discounts. Implement chargeback to make teams cost-aware. Review quarterly." }
    ]
};


// ---------------------- State ----------------------
let currentTopic = localStorage.getItem('currentTopic') || 'Linux';
let allTopics = Object.keys(devOpsData);

// ---------------------- Progress Tracking ----------------------
function initializeProgressTracking() {
    const progressData = localStorage.getItem('topicProgress');
    if (!progressData) {
        const initial = {};
        allTopics.forEach(topic => {
            initial[topic] = { viewed: false, viewedAt: null };
        });
        localStorage.setItem('topicProgress', JSON.stringify(initial));
    }
}

function markTopicViewed(topic) {
    const progress = JSON.parse(localStorage.getItem('topicProgress') || '{}');
    if (!progress[topic]) progress[topic] = {};
    progress[topic].viewed = true;
    progress[topic].viewedAt = new Date().toISOString();
    localStorage.setItem('topicProgress', JSON.stringify(progress));
    updateProgressUI();
}

function getProgressPercentage() {
    const progress = JSON.parse(localStorage.getItem('topicProgress') || '{}');
    const viewed = Object.values(progress).filter(p => p.viewed).length;
    const total = allTopics.length;
    return total > 0 ? Math.round((viewed / total) * 100) : 0;
}

function getViewedTopics() {
    const progress = JSON.parse(localStorage.getItem('topicProgress') || '{}');
    return Object.entries(progress)
        .filter(([_, p]) => p.viewed)
        .map(([topic, _]) => topic);
}

function isTopicViewed(topic) {
    const progress = JSON.parse(localStorage.getItem('topicProgress') || '{}');
    return progress[topic]?.viewed || false;
}

function updateProgressUI() {
    const percentage = getProgressPercentage();
    const progressBtnText = document.getElementById('progressBtnText');
    if (progressBtnText) {
        progressBtnText.textContent = `${percentage}%`;
    }
}

// ---------------------- Theme & Accent ----------------------
function applyTheme(theme) {
    const body = document.body;
    if (theme === 'light') body.classList.add('light'); else body.classList.remove('light');
    localStorage.setItem('theme', theme);
    updateThemeToggleIcon(theme);
}

function updateThemeToggleIcon(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.textContent = theme === 'light' ? '☀️' : '🌙';
}

function applyAccent(accent) {
    const body = document.body;
    body.classList.remove('accent-green','accent-purple','accent-orange');
    if (accent && accent !== 'blue') body.classList.add(`accent-${accent}`);
    localStorage.setItem('accent', accent);
    // Mark active button
    document.querySelectorAll('.accent-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.accent === accent);
    });
}

function bindUIControls() {
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = localStorage.getItem('theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
        });
    }
    const progressBtn = document.getElementById('progressBtn');
    if (progressBtn) {
        progressBtn.addEventListener('click', () => {
            renderTopic('Progress');
        });
    }
    document.querySelectorAll('.accent-btn').forEach(btn => {
        btn.addEventListener('click', () => applyAccent(btn.dataset.accent));
    });
}

// ---------------------- Initialization ----------------------
document.addEventListener('DOMContentLoaded', () => {
    // Initialize progress tracking
    initializeProgressTracking();
    // Initialize quiz progress
    initializeQuizProgress();
    // Restore persisted theme/accent
    applyTheme(localStorage.getItem('theme') || 'dark');
    applyAccent(localStorage.getItem('accent') || 'blue');
    bindUIControls();
    bindTabEvents();
    bindSearch();
    renderTopic(currentTopic);
    focusActiveTab();
    updateProgressUI();
});

// ---------------------- Rendering ----------------------
function renderQuizMenu() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    const search = document.getElementById('searchInput');
    if (search) { search.disabled = true; search.placeholder = 'Quiz menu active'; }
    
    const menu = document.createElement('div');
    menu.className = 'quiz-menu';
    menu.innerHTML = `
        <h2>🎯 Quiz Center</h2>
        <p class="quiz-menu-subtitle">Choose your challenge mode</p>
        
        <div class="quiz-category">
            <h3 class="category-title">📚 Topic-Based Quizzes</h3>
            <p class="category-desc">Sequential quizzes for each DevOps topic with progress tracking</p>
            <div class="quiz-menu-grid">
                <button class="quiz-menu-btn featured" data-action="topic-quizzes">
                    <div class="quiz-btn-header">
                        <span class="quiz-icon">🎓</span>
                    </div>
                    <h3>Topic Quizzes</h3>
                    <p>26+ topics with 10 questions each</p>
                    <div class="quiz-features">
                        <span>✓ Progress tracking</span>
                        <span>✓ Difficulty levels</span>
                        <span>✓ Score history</span>
                    </div>
                </button>
            </div>
        </div>
        
        <div class="quiz-category">
            <h3 class="category-title">🎮 Challenge Quizzes</h3>
            <p class="category-desc">Mixed format quizzes for practice and skill testing</p>
            <div class="quiz-menu-grid">
                <button class="quiz-menu-btn" data-quiz="Quiz Practice">
                    <div class="quiz-btn-header">
                        <span class="quiz-icon">📝</span>
                    </div>
                    <h3>Quiz Practice</h3>
                    <p>General DevOps MCQ</p>
                    <span class="quiz-count">50 questions</span>
                </button>
                <button class="quiz-menu-btn" data-quiz="Quiz2">
                    <div class="quiz-btn-header">
                        <span class="quiz-icon">🖼️</span>
                    </div>
                    <h3>Logo Recognition</h3>
                    <p>Identify DevOps tools</p>
                    <span class="quiz-count">20 images</span>
                </button>
                <button class="quiz-menu-btn" data-quiz="Quiz3">
                    <div class="quiz-btn-header">
                        <span class="quiz-icon">⚡</span>
                    </div>
                    <h3>Sequential General</h3>
                    <p>Mixed DevOps concepts</p>
                    <span class="quiz-count">30 questions</span>
                </button>
                <button class="quiz-menu-btn" data-quiz="Quiz4">
                    <div class="quiz-btn-header">
                        <span class="quiz-icon">🏗️</span>
                    </div>
                    <h3>Terraform Deep Dive</h3>
                    <p>Infrastructure as Code</p>
                    <span class="quiz-count">30 questions</span>
                </button>
                <button class="quiz-menu-btn" data-quiz="Quiz5">
                    <div class="quiz-btn-header">
                        <span class="quiz-icon">🌐</span>
                    </div>
                    <h3>AWS Networking</h3>
                    <p>Cloud network concepts</p>
                    <span class="quiz-count">30 questions</span>
                </button>
                <button class="quiz-menu-btn" data-quiz="Quiz6">
                    <div class="quiz-btn-header">
                        <span class="quiz-icon">⎈</span>
                    </div>
                    <h3>Helm Expert</h3>
                    <p>K8s package management</p>
                    <span class="quiz-count">30 questions</span>
                </button>
            </div>
        </div>
    `;
    container.appendChild(menu);
    
    // Topic quizzes button
    const topicQuizBtn = container.querySelector('[data-action="topic-quizzes"]');
    if (topicQuizBtn) {
        topicQuizBtn.addEventListener('click', () => {
            renderTopicQuizMenu();
        });
    }
    
    // Challenge quiz buttons
    document.querySelectorAll('.quiz-menu-btn[data-quiz]').forEach(btn => {
        btn.addEventListener('click', () => {
            const quizType = btn.dataset.quiz;
            renderTopic(quizType);
        });
    });
}

function renderProgressDashboard() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    const search = document.getElementById('searchInput');
    if (search) { search.disabled = true; search.placeholder = 'Progress dashboard active'; }
    
    const percentage = getProgressPercentage();
    const viewed = getViewedTopics();
    const progress = JSON.parse(localStorage.getItem('topicProgress') || '{}');
    
    const dashboard = document.createElement('div');
    dashboard.className = 'progress-dashboard';
    
    // Overall stats
    const statsHtml = `
        <div class="progress-stats">
            <h2>Your Learning Progress</h2>
            <div class="overall-progress">
                <div class="circular-progress">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" class="progress-bg" />
                        <circle cx="50" cy="50" r="40" class="progress-fill" style="stroke-dashoffset: ${100 - percentage}" />
                    </svg>
                    <div class="progress-text">${percentage}%</div>
                </div>
                <div class="progress-info">
                    <p><strong>${viewed.length}</strong> of <strong>${allTopics.length}</strong> topics explored</p>
                    <p>Keep learning to master DevOps! 🚀</p>
                </div>
            </div>
        </div>
    `;
    
    // Topics grid
    const topicsHtml = `
        <div class="progress-topics">
            <h3>Topic Status</h3>
            <div class="topics-grid">
                ${allTopics.map(topic => {
                    const isViewed = progress[topic]?.viewed || false;
                    const viewedAt = progress[topic]?.viewedAt ? new Date(progress[topic].viewedAt).toLocaleDateString() : '';
                    return `
                        <div class="topic-status ${isViewed ? 'viewed' : 'not-viewed'}">
                            <div class="topic-badge">${isViewed ? '✓' : '○'}</div>
                            <div class="topic-name">${topic}</div>
                            ${isViewed ? `<div class="viewed-date">Viewed: ${viewedAt}</div>` : '<div class="viewed-date">Not yet viewed</div>'}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    // Reset progress button
    const resetHtml = `
        <div class="progress-actions">
            <button id="resetProgress" class="reset-btn">Reset Progress</button>
        </div>
    `;
    
    dashboard.innerHTML = statsHtml + topicsHtml + resetHtml;
    container.appendChild(dashboard);
    
    document.getElementById('resetProgress')?.addEventListener('click', () => {
        if (confirm('Are you sure? This will reset all progress tracking.')) {
            localStorage.removeItem('topicProgress');
            initializeProgressTracking();
            renderProgressDashboard();
        }
    });
}

function renderTopic(topic) {
    if (topic === 'Brain Games') { renderBrainGames(); return; }
    if (topic === 'Quizzes') { renderQuizMenu(); return; }
    if (topic === 'Progress') { renderProgressDashboard(); return; }
    if (['Quiz3','Quiz4','Quiz5','Quiz6'].includes(topic)) { renderSequentialQuiz(topic); return; }
    currentTopic = topic;
    localStorage.setItem('currentTopic', topic);
    markTopicViewed(topic);
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    // Re-enable search (might have been disabled by sequential quizzes)
    const search = document.getElementById('searchInput');
    if (search) { search.disabled = false; search.placeholder = 'Search...'; }
    const data = devOpsData[topic] || [];
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const filtered = data.filter(item => {
        if (!searchTerm) return true;
        const haystack = [item.q];
        if (item.a) haystack.push(item.a);
        if (item.options) haystack.push(...item.options.map(o => String(o)));
        return haystack.some(t => t.toLowerCase().includes(searchTerm));
    });

    if (filtered.length === 0) {
        container.innerHTML = `<p class="empty-msg">No matches for "${escapeHtml(searchTerm)}" in ${escapeHtml(topic)}.</p>`;
        return;
    }

    filtered.forEach((item, idx) => {
        const card = document.createElement('article');
        card.className = 'qa-card';
        card.tabIndex = 0;
        card.setAttribute('aria-labelledby', `q-${idx}`);
        if (item.options) {
            // Multiple choice rendering (supports optional image)
            const optionsHtml = item.options.map((opt, oi) => `
                <button class="mc-option" data-opt-index="${oi}" type="button">${highlight(escapeHtml(opt), searchTerm)}</button>
            `).join('');
            const imageHtml = item.image ? `<img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.alt || 'quiz image')}" class="quiz-image" loading="lazy">` : '';
            card.innerHTML = `
                <h3 id="q-${idx}" class="question">${highlight(item.q, searchTerm)}</h3>
                ${imageHtml}
                <div class="mc-options" data-correct="${item.correct}">
                    ${optionsHtml}
                </div>
                <div class="card-tools">
                    <button class="tool-btn quiz-reset" aria-label="Reset this question" type="button" style="display:none" data-reset>Reset</button>
                    <span class="index">#${idx + 1}</span>
                </div>
            `;
        } else {
            // Standard Q&A
            card.innerHTML = `
                <h3 id="q-${idx}" class="question">${highlight(item.q, searchTerm)}</h3>
                <div class="answer">${highlight(formatMultiline(item.a), searchTerm)}</div>
                <div class="card-tools">
                    <span class="index">#${idx + 1}</span>
                </div>
            `;
        }
        container.appendChild(card);
    });
    wireQuizOptionHandlers(container);
    updateActiveTabButton(topic);
    updateHeaderTopic(topic, filtered.length, data.length);
}

// ---------------------- Sequential Quiz (Quiz3 / Quiz4) ----------------------
let sequentialIndices = {
    Quiz3: parseInt(localStorage.getItem('quiz3Index') || '0', 10),
    Quiz4: parseInt(localStorage.getItem('quiz4Index') || '0', 10),
    Quiz5: parseInt(localStorage.getItem('quiz5Index') || '0', 10),
    Quiz6: parseInt(localStorage.getItem('quiz6Index') || '0', 10)
};
function renderSequentialQuiz(which) {
    currentTopic = which;
    localStorage.setItem('currentTopic', which);
    const container = document.getElementById('questionsContainer');
    const data = devOpsData[which];
    const search = document.getElementById('searchInput');
    if (search) { search.disabled = true; search.placeholder = `Search disabled in ${which}`; }
    container.innerHTML = '';
    updateActiveTabButton(which);
    let idx = sequentialIndices[which];
    if (idx >= data.length) {
        container.innerHTML = `<div class="quiz3-finished"><p>You completed all ${data.length} ${which} questions! 🎉</p><button class="quiz3-btn" id="${which}Restart">Restart</button></div>`;
        document.getElementById(`${which}Restart`).addEventListener('click', () => {
            sequentialIndices[which] = 0; const key = which === 'Quiz3' ? 'quiz3Index' : (which === 'Quiz4' ? 'quiz4Index' : (which === 'Quiz5' ? 'quiz5Index' : 'quiz6Index'));
            localStorage.setItem(key, '0'); renderSequentialQuiz(which);
        });
        updateHeaderTopic(which, data.length, data.length);
        return;
    }
    updateHeaderTopic(which, idx, data.length);
    const wrapper = document.createElement('div');
    wrapper.className = 'quiz3-wrapper';
    const header = document.createElement('div');
    header.className = 'quiz3-header';
    const progress = document.createElement('div'); progress.className = 'quiz3-progress';
    const bar = document.createElement('div'); bar.className = 'quiz3-bar'; bar.style.width = `${(idx / data.length) * 100}%`; progress.appendChild(bar);
    const status = document.createElement('div'); status.className = 'quiz3-status'; status.textContent = `Question ${idx + 1} of ${data.length}`;
    const controls = document.createElement('div'); controls.className = 'quiz3-controls';
    const restartBtn = document.createElement('button'); restartBtn.className = 'quiz3-btn'; restartBtn.textContent = 'Restart';
    restartBtn.addEventListener('click', () => { sequentialIndices[which] = 0; const key = which === 'Quiz3' ? 'quiz3Index' : (which === 'Quiz4' ? 'quiz4Index' : (which === 'Quiz5' ? 'quiz5Index' : 'quiz6Index')); localStorage.setItem(key,'0'); renderSequentialQuiz(which); });
    controls.appendChild(restartBtn);
    header.append(progress, status, controls);
    const card = document.createElement('div'); card.className = 'quiz3-card';
    const item = data[idx];
    card.innerHTML = `<h3>${escapeHtml(item.q)}</h3>`;
    const opts = document.createElement('div'); opts.className = 'mc-options'; opts.setAttribute('data-correct', item.correct);
    item.options.forEach((opt, oi) => {
        const btn = document.createElement('button'); btn.type='button'; btn.className='mc-option'; btn.dataset.optIndex=String(oi); btn.textContent=opt;
        btn.addEventListener('click', () => {
            if (opts.classList.contains('answered')) return;
            opts.classList.add('answered');
            if (oi === item.correct) {
                btn.classList.add('correct'); showToast('Correct ✅','success');
                setTimeout(() => { sequentialIndices[which]++; const key = which === 'Quiz3' ? 'quiz3Index' : (which === 'Quiz4' ? 'quiz4Index' : (which === 'Quiz5' ? 'quiz5Index' : 'quiz6Index')); localStorage.setItem(key, String(sequentialIndices[which])); renderSequentialQuiz(which); }, 650);
            } else {
                btn.classList.add('incorrect'); const correctBtn = opts.querySelector(`.mc-option[data-opt-index='${item.correct}']`); if (correctBtn) correctBtn.classList.add('correct'); showToast('Incorrect ❌','error');
                setTimeout(() => { opts.classList.remove('answered'); btn.classList.remove('incorrect'); correctBtn && correctBtn.classList.remove('correct'); }, 900);
            }
        });
        opts.appendChild(btn);
    });
    card.appendChild(opts); wrapper.append(header, card); container.appendChild(wrapper);
}

function updateHeaderTopic(topic, shown, total) {
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) subtitle.textContent = `${topic} (${shown}/${total})`;
}

function updateActiveTabButton(topic) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.topic === topic);
    });
}

// ---------------------- Events ----------------------
function bindTabEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            renderTopic(btn.dataset.topic);
            btn.focus();
        });
        btn.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') moveFocus(btn, 1);
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') moveFocus(btn, -1);
        });
    });
}

function moveFocus(currentBtn, delta) {
    const buttons = Array.from(document.querySelectorAll('.tab-btn'));
    const idx = buttons.indexOf(currentBtn);
    let next = (idx + delta + buttons.length) % buttons.length;
    buttons[next].focus();
}

function bindSearch() {
    const search = document.getElementById('searchInput');
    search.addEventListener('input', debounce(() => renderTopic(currentTopic), 150));
    search.addEventListener('keydown', e => {
        if (e.key === 'Escape') { search.value = ''; renderTopic(currentTopic); }
    });
}

function wireQuizOptionHandlers(scope) {
    scope.querySelectorAll('.mc-options').forEach(container => {
        const correctIndex = parseInt(container.getAttribute('data-correct'), 10);
        container.querySelectorAll('.mc-option').forEach(btn => {
            btn.addEventListener('click', () => {
                if (container.classList.contains('answered')) return; // prevent re-answer
                const chosen = parseInt(btn.getAttribute('data-opt-index'), 10);
                container.classList.add('answered');
                container.querySelectorAll('.mc-option').forEach(b => {
                    b.classList.add('disabled');
                    b.disabled = true;
                });
                if (chosen === correctIndex) {
                    btn.classList.add('correct');
                    showToast('Correct ✅', 'success');
                } else {
                    btn.classList.add('incorrect');
                    const correctBtn = container.querySelector(`.mc-option[data-opt-index='${correctIndex}']`);
                    if (correctBtn) correctBtn.classList.add('correct');
                    showToast('Incorrect ❌', 'error');
                }
                // Reveal reset button
                const resetBtn = container.parentElement.querySelector('.quiz-reset');
                if (resetBtn) resetBtn.style.display = 'inline-block';
            });
        });
        // Reset handler
        const resetBtn = container.parentElement.querySelector('.quiz-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                container.classList.remove('answered');
                container.querySelectorAll('.mc-option').forEach(b => {
                    b.classList.remove('disabled','correct','incorrect');
                    b.disabled = false;
                });
                resetBtn.style.display = 'none';
                showToast('Reset 🔄', 'info');
            });
        }
    });
}

function focusActiveTab() {
    const active = document.querySelector('.tab-btn.active');
    if (active) active.focus();
}

// ---------------------- Utilities ----------------------
function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}
function escapeAttr(str) { return escapeHtml(str).replace(/"/g, '&quot;'); }
function formatMultiline(str) { return escapeHtml(str).replace(/\n/g, '<br>'); }
function highlight(text, term) {
    if (!term) return text;
    const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, r => '\\' + r)})`, 'gi');
    return text.replace(re, '<mark>$1</mark>');
}
function debounce(fn, wait) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

// ---------------------- Toast ----------------------
function showToast(msg, type = 'info') {
    let el = document.getElementById('toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'toast';
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = `toast toast-${type}`;
    setTimeout(() => el.className = 'toast', 3000);
}

// ---------------------- Sequential Quiz System ----------------------
// Quiz data structure for all DevOps topics
const topicQuizzes = {
    "Linux": [
        { q: "Linux kernel is open source", type: "truefalse", correct: true },
        { q: "Which command shows disk usage?", type: "mcq", options: ["df", "du", "ls", "ps"], correct: 0 },
        { q: "The /etc directory contains ___ files", type: "fill", answer: "configuration", hints: ["config", "conf", "system"] },
        { q: "chmod 755 gives execute permission to everyone", type: "truefalse", correct: true },
        { q: "Which signal kills a process forcefully?", type: "mcq", options: ["SIGTERM", "SIGKILL", "SIGHUP", "SIGINT"], correct: 1 },
        { q: "SSH default port is ___", type: "fill", answer: "22" },
        { q: "systemd is older than SysV init", type: "truefalse", correct: false },
        { q: "Which shows running processes?", type: "mcq", options: ["top", "df", "mount", "fdisk"], correct: 0 },
        { q: "The root user has UID ___", type: "fill", answer: "0" },
        { q: "What does 'sudo' stand for?", type: "mcq", options: ["Super User Do", "System User Do", "Secure User Do", "Super Utility Do"], correct: 0 }
    ],
    "Git": [
        { q: "Git is a distributed version control system", type: "truefalse", correct: true },
        { q: "Which command stages all changes?", type: "mcq", options: ["git add .", "git commit", "git push", "git pull"], correct: 0 },
        { q: "git ___ shows commit history", type: "fill", answer: "log" },
        { q: "Rebase rewrites commit history", type: "truefalse", correct: true },
        { q: "Which creates a new branch?", type: "mcq", options: ["git branch name", "git checkout", "git merge", "git stash"], correct: 0 },
        { q: "git ___ downloads remote changes", type: "fill", answer: "fetch", hints: ["pull", "clone"] },
        { q: "HEAD points to the latest commit", type: "truefalse", correct: true },
        { q: "Which undoes last commit keeping changes?", type: "mcq", options: ["git reset --soft HEAD~1", "git reset --hard", "git revert", "git clean"], correct: 0 },
        { q: "The .git folder stores repository ___", type: "fill", answer: "metadata", hints: ["data", "history", "information"] },
        { q: "What does 'git stash' do?", type: "mcq", options: ["Saves uncommitted changes temporarily", "Deletes changes", "Commits changes", "Pushes to remote"], correct: 0 }
    ],
    "GitHub": [
        { q: "GitHub Actions runs CI/CD workflows", type: "truefalse", correct: true },
        { q: "Which file defines workflows?", type: "mcq", options: [".github/workflows/*.yml", ".git/config", "package.json", "Dockerfile"], correct: 0 },
        { q: "Pull requests enable ___ reviews", type: "fill", answer: "code", hints: ["peer", "team"] },
        { q: "Protected branches can prevent force pushes", type: "truefalse", correct: true },
        { q: "Where are secrets stored?", type: "mcq", options: ["Repository settings", "Workflow files", "README", "Issues"], correct: 0 },
        { q: "GitHub Pages hosts ___ websites", type: "fill", answer: "static" },
        { q: "Dependabot creates automated update PRs", type: "truefalse", correct: true },
        { q: "Which triggers manual workflows?", type: "mcq", options: ["workflow_dispatch", "push", "pull_request", "schedule"], correct: 0 },
        { q: "CODEOWNERS file assigns automatic ___", type: "fill", answer: "reviewers", hints: ["owners", "approvers"] },
        { q: "GitHub uses which VCS?", type: "mcq", options: ["Git", "SVN", "Mercurial", "CVS"], correct: 0 }
    ],
    "Jenkins": [
        { q: "Jenkins is an automation server", type: "truefalse", correct: true },
        { q: "Which defines Jenkins pipeline?", type: "mcq", options: ["Jenkinsfile", "Dockerfile", "package.json", "config.yml"], correct: 0 },
        { q: "Jenkins uses ___ for job configuration", type: "fill", answer: "plugins", hints: ["extensions", "modules"] },
        { q: "Declarative pipeline is simpler than scripted", type: "truefalse", correct: true },
        { q: "Which stage runs tests?", type: "mcq", options: ["Test stage", "Build stage", "Deploy stage", "Init stage"], correct: 0 },
        { q: "Jenkins Master delegates work to ___", type: "fill", answer: "agents", hints: ["slaves", "workers", "nodes"] },
        { q: "Blue Ocean provides modern UI", type: "truefalse", correct: true },
        { q: "Which triggers build on code push?", type: "mcq", options: ["Webhook", "Cron job", "Manual click", "Email"], correct: 0 },
        { q: "Pipeline as Code stores build config in ___", type: "fill", answer: "repository", hints: ["repo", "git", "vcs"] },
        { q: "What language is Jenkins written in?", type: "mcq", options: ["Java", "Python", "Go", "Ruby"], correct: 0 }
    ],
    "Docker": [
        { q: "Docker containers share the host kernel", type: "truefalse", correct: true },
        { q: "Which file defines container image?", type: "mcq", options: ["Dockerfile", "docker-compose.yml", "container.json", "image.yaml"], correct: 0 },
        { q: "docker ___ builds an image", type: "fill", answer: "build" },
        { q: "Containers are lighter than VMs", type: "truefalse", correct: true },
        { q: "Which instruction sets base image?", type: "mcq", options: ["FROM", "RUN", "CMD", "EXPOSE"], correct: 0 },
        { q: "docker ___ lists running containers", type: "fill", answer: "ps", hints: ["container ls"] },
        { q: "Multi-stage builds reduce image size", type: "truefalse", correct: true },
        { q: "Which creates container network?", type: "mcq", options: ["docker network create", "docker create", "docker net new", "docker setup"], correct: 0 },
        { q: "Volumes persist data beyond container ___", type: "fill", answer: "lifetime", hints: ["life", "existence", "removal"] },
        { q: "What does ENTRYPOINT define?", type: "mcq", options: ["Container executable", "Environment variables", "Port mapping", "Volume mount"], correct: 0 }
    ],
    "Docker Commands": [
        { q: "docker run creates and starts a container", type: "truefalse", correct: true },
        { q: "Which stops a container?", type: "mcq", options: ["docker stop", "docker pause", "docker kill", "docker rm"], correct: 0 },
        { q: "docker exec -it container bash opens ___ shell", type: "fill", answer: "interactive", hints: ["bash", "terminal"] },
        { q: "docker logs shows container output", type: "truefalse", correct: true },
        { q: "Which removes unused images?", type: "mcq", options: ["docker image prune", "docker rm", "docker clean", "docker delete"], correct: 0 },
        { q: "docker pull downloads images from ___", type: "fill", answer: "registry", hints: ["hub", "repository"] },
        { q: "docker-compose manages multi-container apps", type: "truefalse", correct: true },
        { q: "Which shows container resource usage?", type: "mcq", options: ["docker stats", "docker top", "docker info", "docker inspect"], correct: 0 },
        { q: "docker tag creates image ___", type: "fill", answer: "alias", hints: ["name", "reference", "label"] },
        { q: "What does 'docker commit' do?", type: "mcq", options: ["Creates image from container", "Pushes to registry", "Starts container", "Builds from Dockerfile"], correct: 0 }
    ],
    "Kubernetes": [
        { q: "Kubernetes orchestrates containerized applications", type: "truefalse", correct: true },
        { q: "Which is smallest deployable unit?", type: "mcq", options: ["Pod", "Container", "Node", "Service"], correct: 0 },
        { q: "kubectl ___ creates resources from YAML", type: "fill", answer: "apply", hints: ["create"] },
        { q: "Services provide stable networking for Pods", type: "truefalse", correct: true },
        { q: "Which manages stateless replicas?", type: "mcq", options: ["Deployment", "StatefulSet", "DaemonSet", "Job"], correct: 0 },
        { q: "ConfigMaps store non-confidential ___", type: "fill", answer: "configuration", hints: ["config", "data"] },
        { q: "Ingress exposes HTTP/HTTPS routes", type: "truefalse", correct: true },
        { q: "Which ensures Pod runs on every node?", type: "mcq", options: ["DaemonSet", "Deployment", "ReplicaSet", "StatefulSet"], correct: 0 },
        { q: "Secrets store sensitive data in ___ encoding", type: "fill", answer: "base64" },
        { q: "What does HPA do?", type: "mcq", options: ["Horizontal Pod Autoscaler", "High Performance API", "Host Port Access", "Health Probe Agent"], correct: 0 }
    ],
    "Kubernetes Commands": [
        { q: "kubectl get pods lists all pods", type: "truefalse", correct: true },
        { q: "Which shows pod logs?", type: "mcq", options: ["kubectl logs", "kubectl describe", "kubectl exec", "kubectl top"], correct: 0 },
        { q: "kubectl delete pod ___ removes a pod", type: "fill", answer: "name", hints: ["podname"] },
        { q: "kubectl describe provides detailed resource info", type: "truefalse", correct: true },
        { q: "Which creates resources from file?", type: "mcq", options: ["kubectl apply -f", "kubectl create", "kubectl run", "kubectl make"], correct: 0 },
        { q: "kubectl exec -it pod -- bash opens ___", type: "fill", answer: "shell", hints: ["terminal", "bash", "console"] },
        { q: "kubectl scale adjusts replica count", type: "truefalse", correct: true },
        { q: "Which shows cluster info?", type: "mcq", options: ["kubectl cluster-info", "kubectl info", "kubectl status", "kubectl version"], correct: 0 },
        { q: "kubectl port-forward enables local ___ access", type: "fill", answer: "port", hints: ["service", "pod"] },
        { q: "What does 'kubectl rollout' manage?", type: "mcq", options: ["Deployment updates", "Storage volumes", "Network policies", "Resource quotas"], correct: 0 }
    ],
    "OpenShift": [
        { q: "OpenShift is built on Kubernetes", type: "truefalse", correct: true },
        { q: "Which command replaces kubectl?", type: "mcq", options: ["oc", "os", "shift", "openshift"], correct: 0 },
        { q: "OpenShift adds ___ features to K8s", type: "fill", answer: "developer", hints: ["enterprise", "security", "additional"] },
        { q: "Routes expose services externally", type: "truefalse", correct: true },
        { q: "Which builds container images?", type: "mcq", options: ["Source-to-Image (S2I)", "Dockerfile only", "Docker build", "Manual creation"], correct: 0 },
        { q: "Projects are OpenShift ___", type: "fill", answer: "namespaces", hints: ["namespace"] },
        { q: "OpenShift includes integrated registry", type: "truefalse", correct: true },
        { q: "Which provides web console?", type: "mcq", options: ["OpenShift UI", "Kubernetes dashboard", "Rancher", "Portainer"], correct: 0 },
        { q: "DeploymentConfigs enable ___ deployments", type: "fill", answer: "automated", hints: ["automatic", "auto", "rolling"] },
        { q: "What company develops OpenShift?", type: "mcq", options: ["Red Hat", "Google", "Microsoft", "Docker"], correct: 0 }
    ],
    "Helm": [
        { q: "Helm is Kubernetes package manager", type: "truefalse", correct: true },
        { q: "Which file defines chart metadata?", type: "mcq", options: ["Chart.yaml", "values.yaml", "templates/", "helmfile"], correct: 0 },
        { q: "helm ___ installs a chart", type: "fill", answer: "install" },
        { q: "Values files allow configuration templating", type: "truefalse", correct: true },
        { q: "Which upgrades a release?", type: "mcq", options: ["helm upgrade", "helm update", "helm deploy", "helm apply"], correct: 0 },
        { q: "Charts are stored in ___", type: "fill", answer: "repositories", hints: ["repos", "registry"] },
        { q: "Helm tracks release history", type: "truefalse", correct: true },
        { q: "Which rolls back release?", type: "mcq", options: ["helm rollback", "helm undo", "helm revert", "helm reset"], correct: 0 },
        { q: "Templates use Go ___ syntax", type: "fill", answer: "template", hints: ["templating"] },
        { q: "What does 'helm list' show?", type: "mcq", options: ["Installed releases", "Available charts", "Repository list", "Template files"], correct: 0 }
    ],
    "Terraform": [
        { q: "Terraform uses declarative configuration", type: "truefalse", correct: true },
        { q: "Which command initializes directory?", type: "mcq", options: ["terraform init", "terraform setup", "terraform start", "terraform new"], correct: 0 },
        { q: "terraform ___ shows execution plan", type: "fill", answer: "plan" },
        { q: "State files track infrastructure", type: "truefalse", correct: true },
        { q: "Which applies changes?", type: "mcq", options: ["terraform apply", "terraform deploy", "terraform execute", "terraform run"], correct: 0 },
        { q: "Resources are defined in .tf ___", type: "fill", answer: "files" },
        { q: "Remote backends enable team collaboration", type: "truefalse", correct: true },
        { q: "Which destroys infrastructure?", type: "mcq", options: ["terraform destroy", "terraform delete", "terraform remove", "terraform clean"], correct: 0 },
        { q: "Variables make configurations ___", type: "fill", answer: "reusable", hints: ["flexible", "dynamic", "parameterized"] },
        { q: "What language does Terraform use?", type: "mcq", options: ["HCL", "YAML", "JSON", "TOML"], correct: 0 }
    ],
    "AWS": [
        { q: "EC2 provides virtual compute instances", type: "truefalse", correct: true },
        { q: "Which is object storage service?", type: "mcq", options: ["S3", "EBS", "EFS", "RDS"], correct: 0 },
        { q: "VPC stands for Virtual Private ___", type: "fill", answer: "Cloud" },
        { q: "Lambda is serverless compute", type: "truefalse", correct: true },
        { q: "Which is managed database service?", type: "mcq", options: ["RDS", "DynamoDB", "Both", "Neither"], correct: 2 },
        { q: "IAM manages ___ and permissions", type: "fill", answer: "identities", hints: ["users", "access", "roles"] },
        { q: "CloudWatch provides monitoring and logging", type: "truefalse", correct: true },
        { q: "Which is CDN service?", type: "mcq", options: ["CloudFront", "Route53", "API Gateway", "ElastiCache"], correct: 0 },
        { q: "Auto Scaling adjusts ___ automatically", type: "fill", answer: "capacity", hints: ["instances", "resources"] },
        { q: "What does ELB stand for?", type: "mcq", options: ["Elastic Load Balancer", "Elastic Linux Box", "Enhanced Load Balancer", "Elastic Layer Backend"], correct: 0 }
    ],
    "Azure": [
        { q: "Azure is Microsoft's cloud platform", type: "truefalse", correct: true },
        { q: "Which is compute service?", type: "mcq", options: ["Virtual Machines", "Blob Storage", "SQL Database", "CDN"], correct: 0 },
        { q: "App Service hosts ___ applications", type: "fill", answer: "web", hints: ["website", "app"] },
        { q: "Resource Groups organize Azure resources", type: "truefalse", correct: true },
        { q: "Which is container orchestrator?", type: "mcq", options: ["AKS", "VM Scale Sets", "App Service", "Functions"], correct: 0 },
        { q: "Azure DevOps provides ___ tools", type: "fill", answer: "CI/CD", hints: ["cicd", "pipeline", "development"] },
        { q: "Blob Storage is object storage", type: "truefalse", correct: true },
        { q: "Which is serverless compute?", type: "mcq", options: ["Azure Functions", "VM", "AKS", "Container Instances"], correct: 0 },
        { q: "ARM templates use ___ format", type: "fill", answer: "JSON" },
        { q: "What is Azure AD?", type: "mcq", options: ["Active Directory identity service", "Application Deployment", "Auto Discovery", "Analytics Dashboard"], correct: 0 }
    ],
    "GCP": [
        { q: "GCP is Google Cloud Platform", type: "truefalse", correct: true },
        { q: "Which is compute service?", type: "mcq", options: ["Compute Engine", "Cloud Storage", "BigQuery", "Pub/Sub"], correct: 0 },
        { q: "GKE runs ___ clusters", type: "fill", answer: "Kubernetes", hints: ["K8s", "container"] },
        { q: "Cloud Functions is serverless", type: "truefalse", correct: true },
        { q: "Which is object storage?", type: "mcq", options: ["Cloud Storage", "Persistent Disk", "Filestore", "BigQuery"], correct: 0 },
        { q: "Cloud Run deploys ___ containers", type: "fill", answer: "serverless", hints: ["stateless", "containerized"] },
        { q: "BigQuery is data warehouse", type: "truefalse", correct: true },
        { q: "Which is load balancer?", type: "mcq", options: ["Cloud Load Balancing", "Cloud CDN", "Cloud DNS", "Cloud Armor"], correct: 0 },
        { q: "IAM controls ___ and permissions", type: "fill", answer: "access", hints: ["identity", "authorization"] },
        { q: "What does Pub/Sub provide?", type: "mcq", options: ["Message queue service", "Database", "Storage", "Compute"], correct: 0 }
    ],
    "Ansible": [
        { q: "Ansible uses agentless architecture", type: "truefalse", correct: true },
        { q: "Which file defines tasks?", type: "mcq", options: ["Playbook (YAML)", "Dockerfile", "Jenkinsfile", "config.json"], correct: 0 },
        { q: "Ansible uses ___ for communication", type: "fill", answer: "SSH", hints: ["ssh", "WinRM"] },
        { q: "Playbooks use YAML syntax", type: "truefalse", correct: true },
        { q: "Which defines host groups?", type: "mcq", options: ["Inventory file", "Playbook", "Role", "Module"], correct: 0 },
        { q: "Roles organize ___ components", type: "fill", answer: "reusable", hints: ["playbook", "configuration"] },
        { q: "Handlers run only when notified", type: "truefalse", correct: true },
        { q: "Which executes ad-hoc commands?", type: "mcq", options: ["ansible command", "ansible-playbook", "ansible-vault", "ansible-galaxy"], correct: 0 },
        { q: "Ansible Galaxy provides shared ___", type: "fill", answer: "roles", hints: ["role", "content"] },
        { q: "What does idempotency mean?", type: "mcq", options: ["Same result on repeat runs", "Runs once only", "Always changes state", "Requires sudo"], correct: 0 }
    ],
    "SaltStack": [
        { q: "Salt uses master-minion architecture", type: "truefalse", correct: true },
        { q: "Which defines configuration?", type: "mcq", options: ["State files (SLS)", "Playbooks", "Manifests", "Charts"], correct: 0 },
        { q: "Salt uses ___ for communication", type: "fill", answer: "ZeroMQ", hints: ["zeromq", "messaging"] },
        { q: "Grains are static minion data", type: "truefalse", correct: true },
        { q: "Which applies states?", type: "mcq", options: ["salt 'target' state.apply", "salt run", "salt deploy", "salt execute"], correct: 0 },
        { q: "Pillars store ___ data", type: "fill", answer: "sensitive", hints: ["secure", "secret", "confidential"] },
        { q: "Salt can run agentless via SSH", type: "truefalse", correct: true },
        { q: "Which shows minion status?", type: "mcq", options: ["salt-run manage.status", "salt status", "salt list", "salt info"], correct: 0 },
        { q: "Reactors enable ___ actions", type: "fill", answer: "automated", hints: ["automatic", "event-driven"] },
        { q: "What language are states written in?", type: "mcq", options: ["YAML", "JSON", "Python", "HCL"], correct: 0 }
    ],
    "Prometheus": [
        { q: "Prometheus is time-series database", type: "truefalse", correct: true },
        { q: "Which language queries metrics?", type: "mcq", options: ["PromQL", "SQL", "GraphQL", "MongoQL"], correct: 0 },
        { q: "Prometheus uses ___ model for collection", type: "fill", answer: "pull", hints: ["scrape", "polling"] },
        { q: "Exporters expose metrics in Prometheus format", type: "truefalse", correct: true },
        { q: "Which component manages alerts?", type: "mcq", options: ["Alertmanager", "Prometheus Server", "Pushgateway", "Exporter"], correct: 0 },
        { q: "Labels enable multi-dimensional ___", type: "fill", answer: "data", hints: ["metrics", "queries"] },
        { q: "Prometheus stores metrics locally", type: "truefalse", correct: true },
        { q: "Which handles short-lived jobs?", type: "mcq", options: ["Pushgateway", "Exporter", "Alertmanager", "Scraper"], correct: 0 },
        { q: "Recording rules pre-compute ___", type: "fill", answer: "queries", hints: ["expressions", "aggregations"] },
        { q: "What is default scrape interval?", type: "mcq", options: ["15 seconds", "30 seconds", "1 minute", "5 seconds"], correct: 0 }
    ],
    "Grafana": [
        { q: "Grafana is visualization platform", type: "truefalse", correct: true },
        { q: "Which organizes dashboards?", type: "mcq", options: ["Folders", "Buckets", "Groups", "Collections"], correct: 0 },
        { q: "Grafana supports multiple data ___", type: "fill", answer: "sources", hints: ["source"] },
        { q: "Dashboards are created with panels", type: "truefalse", correct: true },
        { q: "Which sends notifications?", type: "mcq", options: ["Alert rules", "Queries", "Variables", "Annotations"], correct: 0 },
        { q: "Variables make dashboards ___", type: "fill", answer: "dynamic", hints: ["flexible", "reusable", "parameterized"] },
        { q: "Grafana can connect to Prometheus", type: "truefalse", correct: true },
        { q: "Which shows time-series data?", type: "mcq", options: ["Graph panel", "Table panel", "Stat panel", "Text panel"], correct: 0 },
        { q: "Annotations mark ___ on graphs", type: "fill", answer: "events", hints: ["event", "incidents"] },
        { q: "What format are dashboards stored in?", type: "mcq", options: ["JSON", "YAML", "XML", "TOML"], correct: 0 }
    ],
    "SRE": [
        { q: "SRE applies software engineering to operations", type: "truefalse", correct: true },
        { q: "Which measures reliability?", type: "mcq", options: ["SLI (Service Level Indicator)", "SLA", "SLO", "Error budget"], correct: 0 },
        { q: "SLO defines target ___", type: "fill", answer: "availability", hints: ["reliability", "performance"] },
        { q: "Error budgets balance speed and reliability", type: "truefalse", correct: true },
        { q: "Which is a DORA metric?", type: "mcq", options: ["Deployment frequency", "CPU usage", "Memory consumption", "Disk I/O"], correct: 0 },
        { q: "Toil is repetitive ___ work", type: "fill", answer: "manual", hints: ["operational", "routine"] },
        { q: "Blameless postmortems improve learning", type: "truefalse", correct: true },
        { q: "Which reduces MTTR?", type: "mcq", options: ["Better monitoring & automation", "More meetings", "Slower deploys", "Manual processes"], correct: 0 },
        { q: "On-call rotations distribute ___", type: "fill", answer: "responsibility", hints: ["load", "burden", "work"] },
        { q: "What does MTBF measure?", type: "mcq", options: ["Mean Time Between Failures", "Mean Time Before Fix", "Maximum Time Between Failures", "Minimum Test Before Fix"], correct: 0 }
    ],
    "CI/CD": [
        { q: "CI means Continuous Integration", type: "truefalse", correct: true },
        { q: "Which runs automated tests?", type: "mcq", options: ["CI pipeline", "CD pipeline", "Version control", "Issue tracker"], correct: 0 },
        { q: "CD stands for Continuous ___", type: "fill", answer: "Deployment", hints: ["Delivery"] },
        { q: "Pipelines automate build and deploy", type: "truefalse", correct: true },
        { q: "Which enables rapid feedback?", type: "mcq", options: ["Automated testing", "Manual QA", "Documentation", "Email reports"], correct: 0 },
        { q: "Trunk-based development uses ___ branches", type: "fill", answer: "short-lived", hints: ["short", "feature"] },
        { q: "Blue-green deployment reduces downtime", type: "truefalse", correct: true },
        { q: "Which deployment strategy is safest?", type: "mcq", options: ["Canary", "Big bang", "Recreate", "All at once"], correct: 0 },
        { q: "Feature flags decouple ___ from release", type: "fill", answer: "deployment", hints: ["deploy"] },
        { q: "What is shift-left testing?", type: "mcq", options: ["Test earlier in cycle", "Test only production", "Test after deploy", "Skip testing"], correct: 0 }
    ],
    "DevSecOps": [
        { q: "DevSecOps integrates security into DevOps", type: "truefalse", correct: true },
        { q: "Which scans for vulnerabilities?", type: "mcq", options: ["SAST tools", "Load balancers", "Proxies", "CDNs"], correct: 0 },
        { q: "Shift-left security means testing ___", type: "fill", answer: "early", hints: ["earlier", "sooner"] },
        { q: "Container scanning finds CVEs", type: "truefalse", correct: true },
        { q: "Which stores secrets securely?", type: "mcq", options: ["Vault", "Git repo", "Dockerfile", "README"], correct: 0 },
        { q: "SAST performs ___ code analysis", type: "fill", answer: "static", hints: ["source"] },
        { q: "DAST tests running applications", type: "truefalse", correct: true },
        { q: "Which enforces policies?", type: "mcq", options: ["OPA (Open Policy Agent)", "Jenkins", "Docker", "Helm"], correct: 0 },
        { q: "Secret scanning prevents ___ exposure", type: "fill", answer: "credential", hints: ["secret", "key", "password"] },
        { q: "What is principle of least privilege?", type: "mcq", options: ["Minimum necessary permissions", "Maximum access", "No restrictions", "Admin for all"], correct: 0 }
    ],
    "Networking": [
        { q: "TCP is connection-oriented protocol", type: "truefalse", correct: true },
        { q: "Which layer has IP protocol?", type: "mcq", options: ["Network layer", "Transport layer", "Application layer", "Data link layer"], correct: 0 },
        { q: "DNS resolves names to ___", type: "fill", answer: "IP", hints: ["addresses", "IPs"] },
        { q: "HTTPS uses port 443 by default", type: "truefalse", correct: true },
        { q: "Which is Layer 4 protocol?", type: "mcq", options: ["TCP", "HTTP", "DNS", "SMTP"], correct: 0 },
        { q: "Load balancers distribute ___", type: "fill", answer: "traffic", hints: ["requests", "load"] },
        { q: "VPN encrypts network traffic", type: "truefalse", correct: true },
        { q: "Which protocol is stateless?", type: "mcq", options: ["UDP", "TCP", "FTP", "SSH"], correct: 0 },
        { q: "CDN reduces ___ for users", type: "fill", answer: "latency", hints: ["delay", "lag"] },
        { q: "What does NAT do?", type: "mcq", options: ["Translates IP addresses", "Encrypts data", "Compresses packets", "Routes emails"], correct: 0 }
    ],
    "System Design Basics": [
        { q: "Horizontal scaling adds more servers", type: "truefalse", correct: true },
        { q: "Which is fastest storage?", type: "mcq", options: ["Cache (RAM)", "SSD", "HDD", "Network storage"], correct: 0 },
        { q: "CAP theorem: you can have ___ of three", type: "fill", answer: "two", hints: ["2"] },
        { q: "Sharding partitions database horizontally", type: "truefalse", correct: true },
        { q: "Which pattern decouples services?", type: "mcq", options: ["Message queue", "Direct API calls", "Shared database", "File sharing"], correct: 0 },
        { q: "Idempotency means ___ result on retries", type: "fill", answer: "same", hints: ["identical", "consistent"] },
        { q: "Read replicas improve query performance", type: "truefalse", correct: true },
        { q: "Which prevents cascading failures?", type: "mcq", options: ["Circuit breaker", "Load balancer", "Cache", "CDN"], correct: 0 },
        { q: "Eventual consistency allows temporary ___", type: "fill", answer: "divergence", hints: ["inconsistency", "staleness"] },
        { q: "What is hot storage for?", type: "mcq", options: ["Frequently accessed data", "Archives", "Backups", "Cold data"], correct: 0 }
    ],
    "Shell Scripting": [
        { q: "Bash is a Unix shell", type: "truefalse", correct: true },
        { q: "Which makes script executable?", type: "mcq", options: ["chmod +x", "chmod 644", "chown", "chgrp"], correct: 0 },
        { q: "Shebang starts with ___", type: "fill", answer: "#!", hints: ["hashbang"] },
        { q: "set -e exits on first error", type: "truefalse", correct: true },
        { q: "Which reads user input?", type: "mcq", options: ["read", "echo", "printf", "cat"], correct: 0 },
        { q: "$? contains last command ___ code", type: "fill", answer: "exit", hints: ["return", "status"] },
        { q: "[[ ]] is preferred over [ ] in bash", type: "truefalse", correct: true },
        { q: "Which loops over array?", type: "mcq", options: ["for item in ${array[@]}", "while true", "until false", "if then"], correct: 0 },
        { q: "Variables are referenced with ___", type: "fill", answer: "$", hints: ["dollar"] },
        { q: "What does 'source' do?", type: "mcq", options: ["Executes script in current shell", "Creates new process", "Deletes file", "Compiles code"], correct: 0 }
    ]
};

// Quiz state management
let quizState = {
    topic: null,
    currentQuestion: 0,
    score: 0,
    answers: [],
    startTime: null
};

// Initialize quiz progress storage
function initializeQuizProgress() {
    if (!localStorage.getItem('quizProgress')) {
        const progress = {};
        Object.keys(topicQuizzes).forEach(topic => {
            progress[topic] = {
                completed: false,
                bestScore: 0,
                attempts: 0,
                lastAttempt: null
            };
        });
        localStorage.setItem('quizProgress', JSON.stringify(progress));
    }
}

// Get quiz progress for a topic
function getQuizProgress(topic) {
    const progress = JSON.parse(localStorage.getItem('quizProgress') || '{}');
    return progress[topic] || { completed: false, bestScore: 0, attempts: 0, lastAttempt: null };
}

// Update quiz progress
function updateQuizProgress(topic, score) {
    const progress = JSON.parse(localStorage.getItem('quizProgress') || '{}');
    if (!progress[topic]) {
        progress[topic] = { completed: false, bestScore: 0, attempts: 0, lastAttempt: null };
    }
    
    progress[topic].attempts += 1;
    progress[topic].lastAttempt = new Date().toISOString();
    progress[topic].bestScore = Math.max(progress[topic].bestScore, score);
    
    const percentage = (score / 10) * 100;
    if (percentage >= 70) {
        progress[topic].completed = true;
    }
    
    localStorage.setItem('quizProgress', JSON.stringify(progress));
}

// Render topic quiz selection menu
function renderTopicQuizMenu() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    const search = document.getElementById('searchInput');
    if (search) { search.disabled = true; search.placeholder = 'Topic quiz menu active'; }
    
    const menu = document.createElement('div');
    menu.className = 'topic-quiz-menu';
    
    let menuHTML = `
        <div class="quiz-header">
            <h2>🎯 DevOps Topic Quizzes</h2>
            <p class="quiz-subtitle">Test your knowledge across all DevOps domains</p>
        </div>
        <div class="quiz-stats-summary">
            <div class="stat-card">
                <span class="stat-value">${Object.keys(topicQuizzes).length}</span>
                <span class="stat-label">Total Topics</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${getCompletedQuizCount()}</span>
                <span class="stat-label">Completed</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${getAverageScore()}%</span>
                <span class="stat-label">Avg Score</span>
            </div>
        </div>
        <div class="topic-quiz-grid">
    `;
    
    Object.keys(topicQuizzes).forEach(topic => {
        const progress = getQuizProgress(topic);
        const statusClass = progress.completed ? 'completed' : progress.attempts > 0 ? 'in-progress' : 'not-started';
        const statusIcon = progress.completed ? '✓' : progress.attempts > 0 ? '◐' : '○';
        const difficultyLevel = getDifficultyLevel(topic);
        
        menuHTML += `
            <button class="topic-quiz-card ${statusClass}" data-topic="${topic}">
                <div class="quiz-card-header">
                    <span class="quiz-status-icon">${statusIcon}</span>
                    <span class="quiz-difficulty ${difficultyLevel}">${difficultyLevel}</span>
                </div>
                <h3>${topic}</h3>
                <div class="quiz-card-stats">
                    <span>📝 10 Questions</span>
                    <span>🎯 Best: ${progress.bestScore}/10</span>
                </div>
                ${progress.attempts > 0 ? `<div class="quiz-card-attempts">Attempts: ${progress.attempts}</div>` : ''}
            </button>
        `;
    });
    
    menuHTML += '</div>';
    menu.innerHTML = menuHTML;
    container.appendChild(menu);
    
    // Attach click handlers
    document.querySelectorAll('.topic-quiz-card').forEach(card => {
        card.addEventListener('click', () => {
            const topic = card.dataset.topic;
            startTopicQuiz(topic);
        });
    });
}

// Get difficulty level based on topic
function getDifficultyLevel(topic) {
    const advanced = ['Kubernetes', 'Terraform', 'SRE', 'System Design Basics', 'DevSecOps'];
    const intermediate = ['Docker', 'AWS', 'Azure', 'GCP', 'Prometheus', 'Grafana', 'CI/CD', 'Helm'];
    
    if (advanced.includes(topic)) return 'advanced';
    if (intermediate.includes(topic)) return 'intermediate';
    return 'beginner';
}

// Get completed quiz count
function getCompletedQuizCount() {
    const progress = JSON.parse(localStorage.getItem('quizProgress') || '{}');
    return Object.values(progress).filter(p => p.completed).length;
}

// Get average score
function getAverageScore() {
    const progress = JSON.parse(localStorage.getItem('quizProgress') || '{}');
    const scores = Object.values(progress).filter(p => p.bestScore > 0).map(p => p.bestScore);
    if (scores.length === 0) return 0;
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10);
}

// Start a topic quiz
function startTopicQuiz(topic) {
    quizState = {
        topic: topic,
        currentQuestion: 0,
        score: 0,
        answers: [],
        startTime: Date.now()
    };
    
    renderQuizQuestion();
}

// Render current quiz question
function renderQuizQuestion() {
    const container = document.getElementById('questionsContainer');
    const quiz = topicQuizzes[quizState.topic];
    const question = quiz[quizState.currentQuestion];
    const questionNum = quizState.currentQuestion + 1;
    const totalQuestions = quiz.length;
    const progressPercent = (quizState.currentQuestion / totalQuestions) * 100;
    
    container.innerHTML = '';
    const quizDiv = document.createElement('div');
    quizDiv.className = 'quiz-container';
    
    let questionHTML = `
        <div class="quiz-progress-header">
            <button class="quiz-exit-btn" onclick="confirmQuizExit()">✕ Exit Quiz</button>
            <div class="quiz-topic-title">${quizState.topic}</div>
        </div>
        <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        <div class="quiz-question-counter">
            <span class="current-question">${questionNum}</span>
            <span class="question-separator">/</span>
            <span class="total-questions">${totalQuestions}</span>
        </div>
        <div class="quiz-question-card">
            <h3 class="quiz-question-text">${question.q}</h3>
    `;
    
    if (question.type === 'mcq') {
        questionHTML += '<div class="quiz-options">';
        question.options.forEach((option, index) => {
            questionHTML += `
                <button class="quiz-option" data-index="${index}">
                    <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                    <span class="option-text">${option}</span>
                </button>
            `;
        });
        questionHTML += '</div>';
    } else if (question.type === 'truefalse') {
        questionHTML += `
            <div class="quiz-options quiz-truefalse">
                <button class="quiz-option" data-answer="true">
                    <span class="option-icon">✓</span>
                    <span class="option-text">True</span>
                </button>
                <button class="quiz-option" data-answer="false">
                    <span class="option-icon">✗</span>
                    <span class="option-text">False</span>
                </button>
            </div>
        `;
    } else if (question.type === 'fill') {
        questionHTML += `
            <div class="quiz-fill-container">
                <input type="text" class="quiz-fill-input" placeholder="Type your answer..." autocomplete="off">
                <button class="quiz-submit-btn" disabled>Submit Answer</button>
                ${question.hints ? `<div class="quiz-hints">💡 Hints: ${question.hints.join(', ')}</div>` : ''}
            </div>
        `;
    }
    
    questionHTML += `
        </div>
        <div class="quiz-score-display">Score: ${quizState.score}/${quizState.currentQuestion}</div>
    `;
    
    quizDiv.innerHTML = questionHTML;
    container.appendChild(quizDiv);
    
    // Add animation
    quizDiv.classList.add('quiz-slide-in');
    
    // Attach event handlers
    if (question.type === 'mcq') {
        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => handleMCQAnswer(parseInt(btn.dataset.index)));
        });
    } else if (question.type === 'truefalse') {
        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => handleTrueFalseAnswer(btn.dataset.answer === 'true'));
        });
    } else if (question.type === 'fill') {
        const input = container.querySelector('.quiz-fill-input');
        const submitBtn = container.querySelector('.quiz-submit-btn');
        
        input.addEventListener('input', () => {
            submitBtn.disabled = input.value.trim() === '';
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                handleFillAnswer(input.value.trim());
            }
        });
        
        submitBtn.addEventListener('click', () => {
            handleFillAnswer(input.value.trim());
        });
        
        input.focus();
    }
}

// Handle MCQ answer
function handleMCQAnswer(selectedIndex) {
    const question = topicQuizzes[quizState.topic][quizState.currentQuestion];
    const correct = selectedIndex === question.correct;
    
    quizState.answers.push({ question: question.q, userAnswer: selectedIndex, correct });
    if (correct) quizState.score++;
    
    showAnswerFeedback(correct, question.options[question.correct]);
}

// Handle True/False answer
function handleTrueFalseAnswer(selectedAnswer) {
    const question = topicQuizzes[quizState.topic][quizState.currentQuestion];
    const correct = selectedAnswer === question.correct;
    
    quizState.answers.push({ question: question.q, userAnswer: selectedAnswer, correct });
    if (correct) quizState.score++;
    
    showAnswerFeedback(correct, question.correct ? 'True' : 'False');
}

// Handle fill-in-the-blank answer
function handleFillAnswer(userAnswer) {
    const question = topicQuizzes[quizState.topic][quizState.currentQuestion];
    const normalizedUser = userAnswer.toLowerCase().trim();
    const normalizedCorrect = question.answer.toLowerCase().trim();
    
    // Check answer and hints
    let correct = normalizedUser === normalizedCorrect;
    if (!correct && question.hints) {
        correct = question.hints.some(hint => hint.toLowerCase().trim() === normalizedUser);
    }
    
    quizState.answers.push({ question: question.q, userAnswer, correct });
    if (correct) quizState.score++;
    
    showAnswerFeedback(correct, question.answer);
}

// Show answer feedback
function showAnswerFeedback(correct, correctAnswer) {
    const container = document.getElementById('questionsContainer');
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `quiz-feedback ${correct ? 'correct' : 'incorrect'}`;
    
    feedbackDiv.innerHTML = `
        <div class="feedback-icon">${correct ? '🎉' : '💡'}</div>
        <div class="feedback-text">
            <h3>${correct ? 'Correct!' : 'Not quite right'}</h3>
            ${!correct ? `<p>The correct answer is: <strong>${correctAnswer}</strong></p>` : ''}
        </div>
    `;
    
    container.appendChild(feedbackDiv);
    
    // Play animation
    setTimeout(() => feedbackDiv.classList.add('show'), 10);
    
    // Move to next question or show results
    setTimeout(() => {
        quizState.currentQuestion++;
        if (quizState.currentQuestion < topicQuizzes[quizState.topic].length) {
            renderQuizQuestion();
        } else {
            showQuizResults();
        }
    }, 2000);
}

// Show quiz results
function showQuizResults() {
    const container = document.getElementById('questionsContainer');
    const totalQuestions = topicQuizzes[quizState.topic].length;
    const percentage = Math.round((quizState.score / totalQuestions) * 100);
    const timeTaken = Math.round((Date.now() - quizState.startTime) / 1000);
    const passed = percentage >= 70;
    
    // Update progress
    updateQuizProgress(quizState.topic, quizState.score);
    const progress = getQuizProgress(quizState.topic);
    
    container.innerHTML = '';
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'quiz-results';
    
    resultsDiv.innerHTML = `
        <div class="results-header ${passed ? 'passed' : 'failed'}">
            <div class="results-icon">${passed ? '🏆' : '📚'}</div>
            <h2>${passed ? 'Congratulations!' : 'Keep Learning!'}</h2>
            <p>${passed ? 'You passed the quiz!' : 'Review the material and try again'}</p>
        </div>
        
        <div class="results-score-circle">
            <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="var(--border)" stroke-width="12"/>
                <circle cx="100" cy="100" r="90" fill="none" stroke="var(--accent)" stroke-width="12"
                    stroke-dasharray="${2 * Math.PI * 90}" 
                    stroke-dashoffset="${2 * Math.PI * 90 * (1 - percentage / 100)}"
                    transform="rotate(-90 100 100)"/>
            </svg>
            <div class="score-text">
                <span class="score-number">${percentage}%</span>
                <span class="score-fraction">${quizState.score}/${totalQuestions}</span>
            </div>
        </div>
        
        <div class="results-stats">
            <div class="result-stat">
                <span class="stat-label">Time Taken</span>
                <span class="stat-value">${Math.floor(timeTaken / 60)}:${String(timeTaken % 60).padStart(2, '0')}</span>
            </div>
            <div class="result-stat">
                <span class="stat-label">Best Score</span>
                <span class="stat-value">${progress.bestScore}/10</span>
            </div>
            <div class="result-stat">
                <span class="stat-label">Attempts</span>
                <span class="stat-value">${progress.attempts}</span>
            </div>
        </div>
        
        <div class="results-review">
            <h3>Answer Review</h3>
            <div class="answer-review-list">
                ${quizState.answers.map((ans, idx) => `
                    <div class="review-item ${ans.correct ? 'correct' : 'incorrect'}">
                        <span class="review-number">${idx + 1}</span>
                        <span class="review-icon">${ans.correct ? '✓' : '✗'}</span>
                        <span class="review-question">${ans.question}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="results-actions">
            <button class="quiz-action-btn primary" onclick="startTopicQuiz('${quizState.topic}')">
                🔄 Retry Quiz
            </button>
            <button class="quiz-action-btn secondary" onclick="renderTopicQuizMenu()">
                📚 All Quizzes
            </button>
            <button class="quiz-action-btn secondary" onclick="renderTopic('${quizState.topic}')">
                📖 Study ${quizState.topic}
            </button>
        </div>
    `;
    
    container.appendChild(resultsDiv);
    
    // Trigger confetti animation if passed
    if (passed) {
        createConfetti();
    }
}

// Create confetti animation
function createConfetti() {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0'];
    const container = document.getElementById('questionsContainer');
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        container.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

// Confirm quiz exit
function confirmQuizExit() {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
        renderTopicQuizMenu();
    }
}

// ---------------------- Brain Games ----------------------
function renderBrainGames() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    const search = document.getElementById('searchInput');
    if (search) { search.disabled = true; search.placeholder = 'Brain Games - Train Your Mind!'; }
    
    const gamesDiv = document.createElement('div');
    gamesDiv.className = 'brain-games-container';
    gamesDiv.innerHTML = `
        <div class="games-header">
            <h2 class="games-title">🧠 Brain Games</h2>
            <p class="games-subtitle">Challenge your mind with these fun games!</p>
        </div>
        <div class="games-grid">
            <div class="game-card" onclick="startMemoryGame()">
                <div class="game-icon">🃏</div>
                <h3 class="game-title">Memory Match</h3>
                <p class="game-description">Match pairs of cards and test your memory</p>
                <button class="game-play-btn">Play Now</button>
            </div>
            <div class="game-card" onclick="startNumberSequence()">
                <div class="game-icon">🔢</div>
                <h3 class="game-title">Number Sequence</h3>
                <p class="game-description">Remember and repeat the number sequence</p>
                <button class="game-play-btn">Play Now</button>
            </div>
            <div class="game-card" onclick="startWordScramble()">
                <div class="game-icon">📝</div>
                <h3 class="game-title">Word Scramble</h3>
                <p class="game-description">Unscramble DevOps terms as fast as you can</p>
                <button class="game-play-btn">Play Now</button>
            </div>
            <div class="game-card" onclick="startCountryCapitalGame()">
                <div class="game-icon">🌍</div>
                <h3 class="game-title">Country & Capital</h3>
                <p class="game-description">Match countries with their capitals</p>
                <button class="game-play-btn">Play Now</button>
            </div>
            <div class="game-card" onclick="startCountryFlagGame()">
                <div class="game-icon">🏳️</div>
                <h3 class="game-title">Country & Flag</h3>
                <p class="game-description">Match countries with their flags</p>
                <button class="game-play-btn">Play Now</button>
            </div>
        </div>
    `;
    container.appendChild(gamesDiv);
}

// Memory Match Game
let memoryGameState = { flipped: [], matched: [], moves: 0, startTime: null };

function startMemoryGame() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    const symbols = ['🐳', '☸️', '🔧', '🚀', '⚙️', '🔐', '📦', '🌐'];
    const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    
    memoryGameState = { flipped: [], matched: [], moves: 0, startTime: Date.now() };
    
    const gameDiv = document.createElement('div');
    gameDiv.className = 'memory-game-container';
    gameDiv.innerHTML = `
        <div class="game-header">
            <button class="back-btn" onclick="renderBrainGames()">← Back to Games</button>
            <h2>🃏 Memory Match</h2>
            <div class="game-stats">
                <span>Moves: <strong id="moves">0</strong></span>
                <span>Matched: <strong id="matched">0/8</strong></span>
            </div>
        </div>
        <div class="memory-grid" id="memoryGrid"></div>
    `;
    
    container.appendChild(gameDiv);
    
    const grid = document.getElementById('memoryGrid');
    cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">${symbol}</div>
            </div>
        `;
        card.onclick = () => flipMemoryCard(index, symbol, cards);
        grid.appendChild(card);
    });
}

function flipMemoryCard(index, symbol, cards) {
    if (memoryGameState.flipped.length >= 2 || memoryGameState.matched.includes(index) || memoryGameState.flipped.includes(index)) return;
    
    const card = document.querySelector(`[data-index="${index}"]`);
    card.classList.add('flipped');
    memoryGameState.flipped.push(index);
    
    if (memoryGameState.flipped.length === 2) {
        memoryGameState.moves++;
        document.getElementById('moves').textContent = memoryGameState.moves;
        
        const [first, second] = memoryGameState.flipped;
        if (cards[first] === cards[second]) {
            memoryGameState.matched.push(first, second);
            document.getElementById('matched').textContent = `${memoryGameState.matched.length / 2}/8`;
            memoryGameState.flipped = [];
            
            if (memoryGameState.matched.length === 16) {
                setTimeout(() => {
                    const time = ((Date.now() - memoryGameState.startTime) / 1000).toFixed(1);
                    alert(`🎉 Congratulations! You won!\nMoves: ${memoryGameState.moves}\nTime: ${time}s`);
                }, 500);
            }
        } else {
            setTimeout(() => {
                document.querySelectorAll('.memory-card').forEach((c, i) => {
                    if (i === first || i === second) c.classList.remove('flipped');
                });
                memoryGameState.flipped = [];
            }, 1000);
        }
    }
}

// Number Sequence Game
let numberGameState = { sequence: [], userSequence: [], level: 1, showingSequence: false };

function startNumberSequence() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    numberGameState = { sequence: [], userSequence: [], level: 1, showingSequence: false };
    
    const gameDiv = document.createElement('div');
    gameDiv.className = 'number-game-container';
    gameDiv.innerHTML = `
        <div class="game-header">
            <button class="back-btn" onclick="renderBrainGames()">← Back to Games</button>
            <h2>🔢 Number Sequence</h2>
            <div class="game-stats">
                <span>Level: <strong id="level">1</strong></span>
                <span>Best: <strong id="best">${localStorage.getItem('numberGameBest') || 0}</strong></span>
            </div>
        </div>
        <div class="number-game-content">
            <div class="sequence-display" id="sequenceDisplay">
                <p class="game-instruction">Watch and memorize the sequence!</p>
                <div id="sequenceNumbers"></div>
            </div>
            <div class="number-pad" id="numberPad">
                ${[1,2,3,4,5,6,7,8,9,0].map(n => `<button class="number-btn" onclick="numberInput(${n})">${n}</button>`).join('')}
            </div>
            <button class="start-btn" id="startBtn" onclick="startNumberRound()">Start Level 1</button>
        </div>
    `;
    
    container.appendChild(gameDiv);
}

function startNumberRound() {
    numberGameState.sequence.push(Math.floor(Math.random() * 10));
    numberGameState.userSequence = [];
    numberGameState.showingSequence = true;
    
    document.getElementById('startBtn').disabled = true;
    document.getElementById('sequenceNumbers').innerHTML = '';
    
    const display = document.getElementById('sequenceDisplay');
    display.querySelector('.game-instruction').textContent = 'Watch carefully...';
    
    numberGameState.sequence.forEach((num, i) => {
        setTimeout(() => {
            const numDiv = document.createElement('div');
            numDiv.className = 'sequence-number active';
            numDiv.textContent = num;
            document.getElementById('sequenceNumbers').appendChild(numDiv);
            
            setTimeout(() => numDiv.classList.remove('active'), 500);
        }, i * 1000);
    });
    
    setTimeout(() => {
        numberGameState.showingSequence = false;
        display.querySelector('.game-instruction').textContent = 'Now repeat the sequence!';
        document.getElementById('sequenceNumbers').innerHTML = '';
    }, numberGameState.sequence.length * 1000 + 500);
}

function numberInput(num) {
    if (numberGameState.showingSequence) return;
    
    numberGameState.userSequence.push(num);
    
    const numDiv = document.createElement('div');
    numDiv.className = 'sequence-number';
    numDiv.textContent = num;
    document.getElementById('sequenceNumbers').appendChild(numDiv);
    
    const index = numberGameState.userSequence.length - 1;
    if (numberGameState.userSequence[index] !== numberGameState.sequence[index]) {
        setTimeout(() => {
            alert(`❌ Game Over! You reached level ${numberGameState.level}`);
            const best = parseInt(localStorage.getItem('numberGameBest') || 0);
            if (numberGameState.level > best) {
                localStorage.setItem('numberGameBest', numberGameState.level);
                alert(`🎉 New Best Score: ${numberGameState.level}!`);
            }
            startNumberSequence();
        }, 500);
        return;
    }
    
    if (numberGameState.userSequence.length === numberGameState.sequence.length) {
        numberGameState.level++;
        document.getElementById('level').textContent = numberGameState.level;
        setTimeout(() => {
            document.getElementById('startBtn').textContent = `Start Level ${numberGameState.level}`;
            document.getElementById('startBtn').disabled = false;
        }, 1000);
    }
}

// Word Scramble Game
const devOpsWords = [
    'KUBERNETES', 'DOCKER', 'JENKINS', 'TERRAFORM', 'ANSIBLE',
    'PROMETHEUS', 'GRAFANA', 'PIPELINE', 'CONTAINER', 'ORCHESTRATION',
    'DEPLOYMENT', 'AUTOMATION', 'MONITORING', 'INTEGRATION', 'REPOSITORY'
];

let wordGameState = { currentWord: '', scrambled: '', score: 0, timer: null, timeLeft: 60 };

function startWordScramble() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    wordGameState = { currentWord: '', scrambled: '', score: 0, timer: null, timeLeft: 60 };
    
    const gameDiv = document.createElement('div');
    gameDiv.className = 'word-game-container';
    gameDiv.innerHTML = `
        <div class="game-header">
            <button class="back-btn" onclick="renderBrainGames()">← Back to Games</button>
            <h2>📝 Word Scramble</h2>
            <div class="game-stats">
                <span>Score: <strong id="score">0</strong></span>
                <span>Time: <strong id="timer">60</strong>s</span>
            </div>
        </div>
        <div class="word-game-content">
            <div class="scrambled-word" id="scrambledWord">Click Start to Play!</div>
            <input type="text" id="wordInput" class="word-input" placeholder="Type your answer..." disabled>
            <div class="word-game-actions">
                <button class="word-btn" id="startWordBtn" onclick="startWordRound()">Start Game</button>
                <button class="word-btn secondary" id="skipBtn" onclick="skipWord()" disabled>Skip</button>
            </div>
            <div id="feedback" class="word-feedback"></div>
        </div>
    `;
    
    container.appendChild(gameDiv);
}

function startWordRound() {
    if (!wordGameState.timer) {
        wordGameState.timer = setInterval(() => {
            wordGameState.timeLeft--;
            document.getElementById('timer').textContent = wordGameState.timeLeft;
            if (wordGameState.timeLeft <= 0) {
                endWordGame();
            }
        }, 1000);
    }
    
    document.getElementById('startWordBtn').disabled = true;
    document.getElementById('skipBtn').disabled = false;
    
    const word = devOpsWords[Math.floor(Math.random() * devOpsWords.length)];
    wordGameState.currentWord = word;
    wordGameState.scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
    
    document.getElementById('scrambledWord').textContent = wordGameState.scrambled;
    const input = document.getElementById('wordInput');
    input.disabled = false;
    input.value = '';
    input.focus();
    
    input.onkeypress = (e) => {
        if (e.key === 'Enter') checkWord();
    };
}

function checkWord() {
    const input = document.getElementById('wordInput');
    const guess = input.value.toUpperCase().trim();
    const feedback = document.getElementById('feedback');
    
    if (guess === wordGameState.currentWord) {
        wordGameState.score += 10;
        document.getElementById('score').textContent = wordGameState.score;
        feedback.textContent = '✅ Correct!';
        feedback.className = 'word-feedback correct';
        setTimeout(() => {
            feedback.textContent = '';
            startWordRound();
        }, 1000);
    } else {
        feedback.textContent = '❌ Try again!';
        feedback.className = 'word-feedback incorrect';
        input.value = '';
    }
}

function skipWord() {
    startWordRound();
}

function endWordGame() {
    clearInterval(wordGameState.timer);
    document.getElementById('wordInput').disabled = true;
    document.getElementById('skipBtn').disabled = true;
    document.getElementById('scrambledWord').textContent = `Game Over! Final Score: ${wordGameState.score}`;
    
    const best = parseInt(localStorage.getItem('wordGameBest') || 0);
    if (wordGameState.score > best) {
        localStorage.setItem('wordGameBest', wordGameState.score);
        alert(`🎉 New Best Score: ${wordGameState.score}!`);
    } else {
        alert(`Your Score: ${wordGameState.score}\nBest Score: ${best}`);
    }
    
    document.getElementById('startWordBtn').textContent = 'Play Again';
    document.getElementById('startWordBtn').disabled = false;
    document.getElementById('startWordBtn').onclick = startWordScramble;
}

// Country-Capital Game
const countryCapitalData = [
    { country: 'France', capital: 'Paris' },
    { country: 'Japan', capital: 'Tokyo' },
    { country: 'Australia', capital: 'Canberra' },
    { country: 'Brazil', capital: 'Brasília' },
    { country: 'Egypt', capital: 'Cairo' },
    { country: 'India', capital: 'New Delhi' },
    { country: 'Canada', capital: 'Ottawa' },
    { country: 'Germany', capital: 'Berlin' },
    { country: 'Italy', capital: 'Rome' },
    { country: 'Spain', capital: 'Madrid' },
    { country: 'China', capital: 'Beijing' },
    { country: 'Russia', capital: 'Moscow' },
    { country: 'Mexico', capital: 'Mexico City' },
    { country: 'Argentina', capital: 'Buenos Aires' },
    { country: 'South Korea', capital: 'Seoul' },
    { country: 'Thailand', capital: 'Bangkok' },
    { country: 'Turkey', capital: 'Ankara' },
    { country: 'Greece', capital: 'Athens' },
    { country: 'Poland', capital: 'Warsaw' },
    { country: 'Netherlands', capital: 'Amsterdam' }
];

let countryCapitalState = { selected: null, matched: [], attempts: 0, startTime: null };

function startCountryCapitalGame() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    // Select 8 random pairs
    const pairs = [...countryCapitalData].sort(() => Math.random() - 0.5).slice(0, 8);
    const items = [];
    pairs.forEach(pair => {
        items.push({ type: 'country', value: pair.country, pairId: pair.country });
        items.push({ type: 'capital', value: pair.capital, pairId: pair.country });
    });
    items.sort(() => Math.random() - 0.5);
    
    countryCapitalState = { selected: null, matched: [], attempts: 0, startTime: Date.now() };
    
    const gameDiv = document.createElement('div');
    gameDiv.className = 'country-game-container';
    gameDiv.innerHTML = `
        <div class="game-header">
            <button class="back-btn" onclick="renderBrainGames()">← Back to Games</button>
            <h2>🌍 Country & Capital Match</h2>
            <div class="game-stats">
                <span>Attempts: <strong id="attempts">0</strong></span>
                <span>Matched: <strong id="ccMatched">0/8</strong></span>
            </div>
        </div>
        <div class="country-grid" id="countryGrid"></div>
    `;
    
    container.appendChild(gameDiv);
    
    const grid = document.getElementById('countryGrid');
    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `country-card ${item.type}`;
        card.dataset.index = index;
        card.dataset.pairId = item.pairId;
        card.textContent = item.value;
        card.onclick = () => selectCountryCard(index, item, items);
        grid.appendChild(card);
    });
}

function selectCountryCard(index, item, items) {
    const card = document.querySelector(`[data-index="${index}"]`);
    
    if (card.classList.contains('matched') || card.classList.contains('selected')) return;
    
    if (countryCapitalState.selected === null) {
        countryCapitalState.selected = { index, item };
        card.classList.add('selected');
    } else {
        const firstCard = document.querySelector(`[data-index="${countryCapitalState.selected.index}"]`);
        card.classList.add('selected');
        countryCapitalState.attempts++;
        document.getElementById('attempts').textContent = countryCapitalState.attempts;
        
        if (countryCapitalState.selected.item.pairId === item.pairId && 
            countryCapitalState.selected.item.type !== item.type) {
            // Match found
            setTimeout(() => {
                firstCard.classList.remove('selected');
                firstCard.classList.add('matched');
                card.classList.remove('selected');
                card.classList.add('matched');
                countryCapitalState.matched.push(item.pairId);
                document.getElementById('ccMatched').textContent = `${countryCapitalState.matched.length}/8`;
                
                if (countryCapitalState.matched.length === 8) {
                    const time = ((Date.now() - countryCapitalState.startTime) / 1000).toFixed(1);
                    setTimeout(() => {
                        alert(`🎉 Perfect! You matched all pairs!\nAttempts: ${countryCapitalState.attempts}\nTime: ${time}s`);
                    }, 500);
                }
            }, 500);
        } else {
            // No match
            setTimeout(() => {
                firstCard.classList.remove('selected');
                card.classList.remove('selected');
            }, 1000);
        }
        
        countryCapitalState.selected = null;
    }
}

// Country-Flag Game
const countryFlagData = [
    { country: 'United States', flag: '🇺🇸' },
    { country: 'China', flag: '🇨🇳' },
    { country: 'Japan', flag: '🇯🇵' },
    { country: 'Germany', flag: '🇩🇪' },
    { country: 'India', flag: '🇮🇳' },
    { country: 'United Kingdom', flag: '🇬🇧' },
    { country: 'France', flag: '🇫🇷' },
    { country: 'Italy', flag: '🇮🇹' },
    { country: 'Brazil', flag: '🇧🇷' },
    { country: 'Canada', flag: '🇨🇦' },
    { country: 'Russia', flag: '🇷🇺' },
    { country: 'South Korea', flag: '🇰🇷' },
    { country: 'Spain', flag: '🇪🇸' },
    { country: 'Australia', flag: '🇦🇺' },
    { country: 'Mexico', flag: '🇲🇽' },
    { country: 'Indonesia', flag: '🇮🇩' },
    { country: 'Netherlands', flag: '🇳🇱' },
    { country: 'Saudi Arabia', flag: '🇸🇦' },
    { country: 'Turkey', flag: '🇹🇷' },
    { country: 'Switzerland', flag: '🇨🇭' },
    { country: 'Poland', flag: '🇵🇱' },
    { country: 'Argentina', flag: '🇦🇷' },
    { country: 'Belgium', flag: '🇧🇪' },
    { country: 'Sweden', flag: '🇸🇪' },
    { country: 'Ireland', flag: '🇮🇪' },
    { country: 'Thailand', flag: '🇹🇭' },
    { country: 'Austria', flag: '🇦🇹' },
    { country: 'Norway', flag: '🇳🇴' },
    { country: 'United Arab Emirates', flag: '🇦🇪' },
    { country: 'Nigeria', flag: '🇳🇬' },
    { country: 'Israel', flag: '🇮🇱' },
    { country: 'South Africa', flag: '🇿🇦' },
    { country: 'Singapore', flag: '🇸🇬' },
    { country: 'Malaysia', flag: '🇲🇾' },
    { country: 'Denmark', flag: '🇩🇰' },
    { country: 'Philippines', flag: '🇵🇭' },
    { country: 'Hong Kong', flag: '🇭🇰' },
    { country: 'Colombia', flag: '🇨🇴' },
    { country: 'Pakistan', flag: '🇵🇰' },
    { country: 'Chile', flag: '🇨🇱' },
    { country: 'Finland', flag: '🇫🇮' },
    { country: 'Bangladesh', flag: '🇧🇩' },
    { country: 'Egypt', flag: '🇪🇬' },
    { country: 'Vietnam', flag: '🇻🇳' },
    { country: 'Czech Republic', flag: '🇨🇿' },
    { country: 'Romania', flag: '🇷🇴' },
    { country: 'Portugal', flag: '🇵🇹' },
    { country: 'Peru', flag: '🇵🇪' },
    { country: 'Greece', flag: '🇬🇷' },
    { country: 'New Zealand', flag: '🇳🇿' },
    { country: 'Qatar', flag: '🇶🇦' },
    { country: 'Kazakhstan', flag: '🇰🇿' },
    { country: 'Hungary', flag: '🇭🇺' },
    { country: 'Kuwait', flag: '🇰🇼' },
    { country: 'Ukraine', flag: '🇺🇦' },
    { country: 'Morocco', flag: '🇲🇦' },
    { country: 'Ecuador', flag: '🇪🇨' },
    { country: 'Slovakia', flag: '🇸🇰' },
    { country: 'Kenya', flag: '🇰🇪' },
    { country: 'Ethiopia', flag: '🇪🇹' },
    { country: 'Dominican Republic', flag: '🇩🇴' },
    { country: 'Puerto Rico', flag: '🇵🇷' },
    { country: 'Guatemala', flag: '🇬🇹' },
    { country: 'Sri Lanka', flag: '🇱🇰' },
    { country: 'Myanmar', flag: '🇲🇲' },
    { country: 'Luxembourg', flag: '🇱🇺' },
    { country: 'Uruguay', flag: '🇺🇾' },
    { country: 'Costa Rica', flag: '🇨🇷' },
    { country: 'Panama', flag: '🇵🇦' },
    { country: 'Croatia', flag: '🇭🇷' },
    { country: 'Bulgaria', flag: '🇧🇬' },
    { country: 'Lithuania', flag: '🇱🇹' },
    { country: 'Slovenia', flag: '🇸🇮' },
    { country: 'Tunisia', flag: '🇹🇳' },
    { country: 'Jordan', flag: '🇯🇴' },
    { country: 'Bolivia', flag: '🇧🇴' },
    { country: 'Ghana', flag: '🇬🇭' },
    { country: 'Ivory Coast', flag: '🇨🇮' },
    { country: 'Paraguay', flag: '🇵🇾' },
    { country: 'Uganda', flag: '🇺🇬' },
    { country: 'Lebanon', flag: '🇱🇧' },
    { country: 'Latvia', flag: '🇱🇻' },
    { country: 'Estonia', flag: '🇪🇪' },
    { country: 'Cambodia', flag: '🇰🇭' },
    { country: 'Cameroon', flag: '🇨🇲' },
    { country: 'Zimbabwe', flag: '🇿🇼' },
    { country: 'Senegal', flag: '🇸🇳' },
    { country: 'Angola', flag: '🇦🇴' },
    { country: 'Jamaica', flag: '🇯🇲' },
    { country: 'Trinidad and Tobago', flag: '🇹🇹' },
    { country: 'Iceland', flag: '🇮🇸' },
    { country: 'Malta', flag: '🇲🇹' },
    { country: 'Cyprus', flag: '🇨🇾' },
    { country: 'Bahrain', flag: '🇧🇭' },
    { country: 'Albania', flag: '🇦🇱' },
    { country: 'Mongolia', flag: '🇲🇳' },
    { country: 'Namibia', flag: '🇳🇦' },
    { country: 'Botswana', flag: '🇧🇼' }
];


let countryFlagState = { selected: null, matched: [], attempts: 0, startTime: null };

function startCountryFlagGame() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    // Select 8 random pairs
    const pairs = [...countryFlagData].sort(() => Math.random() - 0.5).slice(0, 8);
    const items = [];
    pairs.forEach(pair => {
        items.push({ type: 'country', value: pair.country, pairId: pair.country });
        items.push({ type: 'flag', value: pair.flag, pairId: pair.country });
    });
    items.sort(() => Math.random() - 0.5);
    
    countryFlagState = { selected: null, matched: [], attempts: 0, startTime: Date.now() };
    
    const gameDiv = document.createElement('div');
    gameDiv.className = 'country-game-container';
    gameDiv.innerHTML = `
        <div class="game-header">
            <button class="back-btn" onclick="renderBrainGames()">← Back to Games</button>
            <h2>🏳️ Country & Flag Match</h2>
            <div class="game-stats">
                <span>Attempts: <strong id="attempts">0</strong></span>
                <span>Matched: <strong id="cfMatched">0/8</strong></span>
            </div>
        </div>
        <div class="country-grid" id="flagGrid"></div>
    `;
    
    container.appendChild(gameDiv);
    
    const grid = document.getElementById('flagGrid');
    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `country-card ${item.type}`;
        card.dataset.index = index;
        card.dataset.pairId = item.pairId;
        if (item.type === 'flag') {
            card.innerHTML = `<span class="flag-emoji">${item.value}</span>`;
        } else {
            card.textContent = item.value;
        }
        card.onclick = () => selectFlagCard(index, item, items);
        grid.appendChild(card);
    });
}

function selectFlagCard(index, item, items) {
    const card = document.querySelector(`[data-index="${index}"]`);
    
    if (card.classList.contains('matched') || card.classList.contains('selected')) return;
    
    if (countryFlagState.selected === null) {
        countryFlagState.selected = { index, item };
        card.classList.add('selected');
    } else {
        const firstCard = document.querySelector(`[data-index="${countryFlagState.selected.index}"]`);
        card.classList.add('selected');
        countryFlagState.attempts++;
        document.getElementById('attempts').textContent = countryFlagState.attempts;
        
        if (countryFlagState.selected.item.pairId === item.pairId && 
            countryFlagState.selected.item.type !== item.type) {
            // Match found
            setTimeout(() => {
                firstCard.classList.remove('selected');
                firstCard.classList.add('matched');
                card.classList.remove('selected');
                card.classList.add('matched');
                countryFlagState.matched.push(item.pairId);
                document.getElementById('cfMatched').textContent = `${countryFlagState.matched.length}/8`;
                
                if (countryFlagState.matched.length === 8) {
                    const time = ((Date.now() - countryFlagState.startTime) / 1000).toFixed(1);
                    setTimeout(() => {
                        alert(`🎉 Excellent! You matched all flags!\nAttempts: ${countryFlagState.attempts}\nTime: ${time}s`);
                    }, 500);
                }
            }, 500);
        } else {
            // No match
            setTimeout(() => {
                firstCard.classList.remove('selected');
                card.classList.remove('selected');
            }, 1000);
        }
        
        countryFlagState.selected = null;
    }
}

// Expose for debugging (optional)
window.devOpsData = devOpsData;
window.renderTopic = renderTopic;
window.topicQuizzes = topicQuizzes;
window.startTopicQuiz = startTopicQuiz;
window.renderTopicQuizMenu = renderTopicQuizMenu;
window.confirmQuizExit = confirmQuizExit;
window.renderBrainGames = renderBrainGames;

