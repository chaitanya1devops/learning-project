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
        { q: "What is the difference between a hard link and a soft link?", a: "Hard link points directly to inode; survives original file deletion. Soft (symbolic) link is a shortcut referencing a pathname; breaks if target removed." },
        { q: "Explain load average numbers.", a: "Three numbers showing runnable + uninterruptible tasks over 1, 5, 15 minutes. Rough guide: if load > CPU cores count, system is overloaded." },
        { q: "How to find which process is using a port?", a: "Use: lsof -i :PORT or sudo netstat -tulpn | grep PORT. On modern systems: ss -tulpn | grep PORT." },
        { q: "Difference between grep, egrep, fgrep?", a: "grep: basic regex. egrep: extended regex (same as grep -E). fgrep: fixed strings (same as grep -F) faster for literal matches." },
        { q: "What does nohup do?", a: "Runs a command immune to hangups (SIGHUP); output redirected to nohup.out unless specified." },
        { q: "Explain nice vs renice.", a: "nice starts process with adjusted priority (niceness). renice changes niceness of running process. Higher niceness = lower priority." },
        { q: "How to view real-time disk I/O?", a: "Use iostat -x 1, atop, pidstat -d, or dstat." },
        { q: "Purpose of /proc filesystem?", a: "Pseudo-filesystem exposing kernel + process info (runtime). Useful for introspection (cpuinfo, meminfo, mounts)." },
        { q: "Difference between ext4 and XFS?", a: "ext4 simpler, widely compatible; XFS excels at parallel I/O and large files; XFS lacks shrink support." },
        { q: "How to troubleshoot high memory usage?", a: "Check free -m, /proc/meminfo, top or htop (RES vs VIRT), pmap PID, oomkill logs in dmesg." },
        { q: "What is systemd?", a: "Modern init system managing services, sockets, timers, cgroups, logging (journal). Replaces SysV init scripts." },
        { q: "Difference between runlevel and systemd target?", a: "Runlevels are numeric legacy states; systemd targets are named units grouping services (e.g., multi-user.target)." },
        { q: "How to list open files by a process?", a: "Use lsof -p <PID> or ls -l /proc/<PID>/fd." },
        { q: "Explain inode exhaustion.", a: "Occurs when filesystem runs out of inodes before space, usually too many small files; requires reformat or cleanup." },
        { q: "What is vm.swappiness?", a: "Kernel parameter controlling tendency to swap (0 minimal, 100 aggressive). Adjust via sysctl." },
        { q: "Difference between /bin and /usr/bin?", a: "/bin historically essential binaries for boot; /usr/bin non-essential user binaries. On modern distros often merged." },
        { q: "Purpose of /etc/fstab?", a: "Defines filesystems to mount at boot with options and mount points." },
        { q: "What is setuid bit?", a: "When set on executable, process runs with file owner's privileges (e.g., passwd). Represented as 's' in permissions." },
        { q: "What is sticky bit?", a: "On directories (e.g., /tmp) prevents users from deleting others' files; shown as 't'." },
        { q: "Numeric file permission 764 means?", a: "Owner: rwx(7), group: rw-(6), others: r--(4)." },
        { q: "How to trace system calls of a process?", a: "Use strace -p <PID> or strace <command>." },
        { q: "Difference between cron and systemd timers?", a: "cron simple time-based jobs; systemd timers integrate with service units, dependencies, calendar expressions." },
        { q: "What does iostat await mean?", a: "Average time (ms) for I/O request including queuing and service time; high values indicate storage latency." },
        { q: "How to check TCP connections per state?", a: "Use ss -tan | awk '{print $2}' | sort | uniq -c or netstat -ant (legacy)." },
        { q: "Difference between top and htop?", a: "htop offers interactive UI, color, scrolling, tree view; top basic text view." },
        { q: "/dev/null vs /dev/zero?", a: "/dev/null discards writes, reads EOF; /dev/zero produces infinite zero bytes." },
        { q: "SELinux enforcing vs permissive?", a: "Enforcing blocks unauthorized actions; permissive logs denials only." },
        { q: "AppArmor vs SELinux?", a: "Both MAC systems; SELinux label-based, AppArmor path-based easier to adopt but less granular." },
        { q: "What is ulimit used for?", a: "Sets shell resource limits (file descriptors, stack size, etc.) per user/session." },
        { q: "KVM vs containers?", a: "KVM full virtualization (separate kernels); containers share host kernel offering lighter isolation." },
        { q: "How to find largest directories quickly?", a: "Use du -h --max-depth=1 or du -sh * | sort -h." }
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
        { q: "Difference between image and container?", a: "Image is immutable template; container is a running instance of that image." },
        { q: "Explain COPY vs ADD.", a: "COPY copies files. ADD adds extra features (remote URLs, auto-extract archives). Prefer COPY unless needed." },
        { q: "What is multi-stage build?", a: "Use multiple FROM stages to build then copy final artifacts into slim runtime image reducing size." },
        { q: "How to reduce image size?", a: "Use slim base, multi-stage, combine RUN layers, clean cache, pick alpine (caution glibc)." },
        { q: "Difference between CMD and ENTRYPOINT?", a: "ENTRYPOINT defines executable; CMD supplies default args. Overriding differs (docker run)." },
        { q: "What is Docker networking bridge?", a: "Default network providing NAT + DNS for containers on same host enabling inter-container communication." },
        { q: "Purpose of docker compose?", a: "Declarative multi-container orchestration for dev/test environments." },
        { q: "How to persist data?", a: "Use volumes (named or host mount) to store data beyond container lifecycle." },
        { q: "Difference between bind mount and volume?", a: "Bind mounts map host path; volumes managed by Docker (better portability & isolation)." },
        { q: "Inspect container resource usage?", a: "docker stats, or docker inspect for config; use cgroups for deeper metrics." },
        { q: "Layer caching optimization?", a: "Order Dockerfile instructions so frequently changing lines appear later preserving earlier cached layers." },
        { q: "Healthcheck instruction purpose?", a: "Defines command to determine container health enabling orchestration decisions." },
        { q: "Difference between ENV and ARG?", a: "ARG available at build time; ENV persists in final image runtime environment." },
        { q: "Container logs rotation?", a: "Configure daemon log-driver options (json-file max-size/max-file) or external logging driver." },
        { q: "How to debug networking inside container?", a: "Use docker exec tools (curl, dig, ip), inspect network settings with docker inspect, create temporary busybox." },
        { q: "Purpose of scratch base image?", a: "Minimal empty image for statically compiled binaries reducing attack surface." },
        { q: "Docker registry vs repository?", a: "Registry is service storing images; repository is collection of tagged images under a name." },
        { q: "Image tag latest pitfalls?", a: "Mutable reference can cause non-reproducible builds; prefer explicit version tags." },
        { q: "Container security best practices?", a: "Drop root user, minimal packages, scan images, sign & verify, set resource limits." },
        { q: "Difference between pause and stop?", a: "pause sends SIGSTOP freezing processes; stop sends SIGTERM then SIGKILL gracefully ending." },
        { q: "How to limit CPU usage?", a: "Use --cpus or --cpu-quota/--cpu-period flags; also cgroups directly in orchestrators." },
        { q: "Secrets handling in containers?", a: "Use orchestrator secret stores (Docker Swarm/K8s), avoid baking into images or env logs." },
        { q: "Multi-arch image creation?", a: "Use buildx with platforms flag and manifest lists to support ARM/AMD architectures." },
        { q: "Docker swarm difference vs K8s?", a: "Swarm simpler built-in clustering; Kubernetes richer ecosystem and features (CRDs, advanced scheduling)." },
        { q: "What is an OCI image?", a: "Image following Open Container Initiative specification ensuring interoperability across runtimes." },
        { q: "Immutable infrastructure concept with images?", a: "Rebuild and redeploy new images for changes rather than patching running containers." },
        { q: "How to scan image for CVEs?", a: "Use docker scan, Trivy, Clair, or registry integrated scanners before deployment." },
        { q: "Why pin base image digests?", a: "Ensures reproducible builds since tags can move; digest is immutable reference." }
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
        { q: "What is a Pod?", a: "Smallest deployable unit containing one or more tightly coupled containers sharing network & storage." },
        { q: "Deployment vs StatefulSet?", a: "Deployment for stateless replicated sets; StatefulSet adds stable identity & storage for stateful apps." },
        { q: "Role of Service object?", a: "Stable virtual IP and DNS for pod set, enabling load balancing and discovery." },
        { q: "ConfigMap vs Secret?", a: "Secret base64-encoded sensitive data; ConfigMap for non-sensitive config. Mounted or env injected." },
        { q: "Horizontal Pod Autoscaler trigger?", a: "Metrics (CPU by default or custom) adjusting replica count to meet target utilization." },
        { q: "Difference between ClusterIP, NodePort, LoadBalancer?", a: "ClusterIP internal only; NodePort exposes fixed port on nodes; LoadBalancer provisions external LB (cloud)." },
        { q: "What is etcd?", a: "Consistent distributed key-value store backing cluster state for API server." },
        { q: "Readiness vs Liveness probe?", a: "Readiness gates traffic acceptance; liveness restarts container if unhealthy." },
        { q: "Explain taints and tolerations.", a: "Taints repel pods from nodes unless pods have matching tolerations, used for dedicated workloads." },
        { q: "What is kube-proxy?", a: "Maintains network rules for service abstraction (iptables/ipvs) routing service traffic to pods." },
        { q: "Role of Ingress controller?", a: "Implements Ingress resources providing HTTP routing, TLS termination, path-based rules." },
        { q: "Difference between Requests and Limits?", a: "Requests guarantee baseline resources for scheduling; limits cap maximum usage." },
        { q: "DaemonSet use-case?", a: "Ensures a pod copy runs on every (or selected) node for agents/logging/monitoring." },
        { q: "Job vs CronJob?", a: "Job runs to completion once; CronJob schedules Jobs at defined intervals." },
        { q: "EphemeralContainers purpose?", a: "Debug running Pod by injecting temporary container without restart (1.25+)." },
        { q: "Difference between ReplicaSet and Deployment?", a: "ReplicaSet ensures pod count; Deployment adds rollout strategy, history, updates." },
        { q: "RollingUpdate strategy parameters?", a: "maxUnavailable, maxSurge tune parallel replacement count balancing availability." },
        { q: "Cluster Autoscaler vs HPA?", a: "CA scales nodes; HPA scales pods; often used together for workload elasticity." },
        { q: "What are ResourceQuotas?", a: "Namespace-level limits on compute, storage, object counts controlling fairness." },
        { q: "PodDisruptionBudget purpose?", a: "Ensures minimum available pods during voluntary disruptions (evictions, upgrades)." },
        { q: "Init container use-case?", a: "Run setup tasks (migrations, config fetch) before app containers start." },
        { q: "Sidecar pattern?", a: "Auxiliary container augmenting primary (logging, proxy, metrics)." },
        { q: "ServiceAccount token use?", a: "Grants in-cluster API access; mounted automatically unless disabled." },
        { q: "NetworkPolicy objective?", a: "Define allowed ingress/egress traffic at pod level enforcing segmentation." },
        { q: "CSI driver purpose?", a: "Container Storage Interface plugin enabling dynamic storage provisioning." },
        { q: "What is a CRD?", a: "CustomResourceDefinition extends API with new resource kinds enabling operators." },
        { q: "Operator pattern?", a: "Controller managing application lifecycle via custom resources embedding domain logic." },
        { q: "Why use namespaces?", a: "Logical isolation for resources, quotas, access control grouping environments or teams." },
        { q: "How to debug a CrashLoopBackOff?", a: "kubectl logs previous container, describe pod events, check image, probes, resources." },
        { q: "etcd backup importance?", a: "Cluster state resides there; regular snapshots required for disaster recovery." }
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
        { q: "What is Helm?", a: "Package manager for Kubernetes enabling chart-based deployments and templated manifests." },
        { q: "Values.yaml purpose?", a: "Central configuration customizing templates; can override via --set or -f custom-values." },
        { q: "Helm chart structure?", a: "Chart.yaml, values.yaml, templates/, charts/ (dependencies), NOTES.txt for post-install info." },
        { q: "Difference between helm upgrade and install?", a: "install creates new release; upgrade modifies existing release keeping revision history." },
        { q: "What are release revisions?", a: "Sequential versions of a deployed chart; rollbacks possible via helm rollback <release> <rev>." },
        { q: "Helm dependency update?", a: "Define in Chart.yaml under dependencies then run helm dependency update to fetch packages." },
        { q: "Template functions usage?", a: "Go templates enabling logic (if, range, include, default, lookup)." },
        { q: "Secret management with Helm?", a: "Use external tools (sealed-secrets, SOPS) or separate secret management pipelines; avoid committing plaintext." },
        { q: "Helm diff plugin use-case?", a: "Shows changes between releases prior to upgrade for safer deployments." },
        { q: "Best practice for large charts?", a: "Use subcharts, library charts, consistent values schema, minimize template logic complexity." },
        { q: "helm template command usage?", a: "Render manifests locally for review without installing into cluster." },
        { q: "Chart versioning strategy?", a: "SemVer for Chart.yaml version ensures upgrade expectations and compatibility tracking." },
        { q: "Global values purpose?", a: "Shared configuration accessible across subcharts reducing duplication." },
        { q: "_helpers.tpl role?", a: "Contains named template helpers for reuse (labels, annotations)." },
        { q: "Difference between values override precedence?", a: "--set overrides highest; then multiple -f files (last wins); default values.yaml lowest." },
        { q: "Helm uninstall retention?", a: "Release metadata removed; can keep history with helm rollback only if not purged in older versions." },
        { q: "helm upgrade --atomic purpose?", a: "Automatically rolls back if upgrade fails ensuring no partial state." },
        { q: "Chart repository index.yaml?", a: "Metadata listing chart versions enabling search & retrieval (helm repo index)." },
        { q: "How to manage dependencies?", a: "List in Chart.yaml then run helm dependency update to vendor under charts/." },
        { q: "Security considerations?", a: "Audit templates, avoid privileged defaults, parameterize sensitive mounts." },
        { q: "Helm lifecycle hooks?", a: "Annotations triggering jobs pre/post install/upgrade for migration or validation tasks." },
        { q: "Library charts?", a: "Charts without installable objects providing shared templates for other charts." },
        { q: "helm pull usage?", a: "Download chart archive locally for inspection or modification." },
        { q: "Kustomize vs Helm difference?", a: "Helm templating + packaging; Kustomize patch/overlay existing YAML without templates." },
        { q: "Helm OCI registry support?", a: "Push/pull charts as OCI artifacts (helm registry login, helm push, helm install oci://...)." },
        { q: "Values schema enforcement?", a: "Use JSON schema in values.schema.json to validate provided values at install time." },
        { q: "How to handle secret rendering?", a: "Encrypt with SOPS or use externalSecrets operator rather than plaintext in values." },
        { q: "Chart testing?", a: "Use helm unittest or chart-testing action to validate templates across sample values." },
        { q: "Upgrade diff risk mitigation?", a: "Review helm diff output + backup cluster state for critical resources before applying." }
    ],
    "Terraform": [
        { q: "What is Terraform state?", a: "A snapshot of managed resources mapping real world to configuration enabling diff plans." },
        { q: "Purpose of terraform plan?", a: "Generates execution proposal showing changes before apply for review & safety." },
        { q: "Difference between variable and local?", a: "Variable external input; local computed helper without external override." },
        { q: "What are providers?", a: "Plugins enabling resource management for specific platforms (AWS, Azure, etc.)." },
        { q: "Why remote backend?", a: "Shared state, locking, durability (e.g. S3 + DynamoDB lock)." },
        { q: "Module best practices?", a: "Version pinning, minimal outputs, clear input variables, avoid tight coupling." },
        { q: "Lifecycle ignore_changes usage?", a: "Prevent updates to certain attributes (e.g., external managed fields) preserving drift." },
        { q: "Difference between count and for_each?", a: "count index-based; for_each uses map/set keys creating stable addressing." },
        { q: "Sensitive data handling?", a: "Mark variables sensitive, use vault integration, avoid logging outputs." },
        { q: "State locking importance?", a: "Prevents concurrent modifications causing corruption; remote backends often implement." },
        { q: "terraform import purpose?", a: "Brings existing infrastructure into state allowing management without recreation." },
        { q: "Difference between data and resource blocks?", a: "resource manages lifecycle; data fetches read-only external info for interpolation." },
        { q: "What are outputs used for?", a: "Expose derived values for parent modules or external tooling (pipeline stages)." },
        { q: "Backend migration procedure?", a: "Configure new backend, run terraform init -migrate-state to transfer safely." },
        { q: "How to prevent accidental destroy?", a: "Set lifecycle { prevent_destroy = true } on critical resources." },
        { q: "Terraform Cloud advantages?", a: "Remote runs, policy enforcement (Sentinel), team collaboration, secure variables." },
        { q: "State file security?", a: "Contains secrets (IDs, attributes); encrypt at rest, restrict access, avoid committing to VCS." },
        { q: "Plan file usage?", a: "Binary artifact produced by terraform plan -out used to apply exactly same changes." },
        { q: "Workspace concept?", a: "Separate state instances (e.g., dev/stage/prod) sharing same configuration code." },
        { q: "Handling provider version constraints?", a: "Use required_providers block with version = \"~> x.y\" for compatibility control." },
        { q: "What is drift detection?", a: "Identifying real-world changes not captured in state during plan causing proposed updates." },
        { q: "Dynamic blocks purpose?", a: "Generate nested configuration programmatically based on variable collections." },
        { q: "Taint command usage?", a: "Marks resource for recreation on next apply: terraform taint <res>. (Deprecated for state rm + replace)." },
        { q: "How to reference module outputs?", a: "module.<name>.<output> used in root or other modules." },
        { q: "Sentinel policy examples?", a: "Ensure tagging, restrict instance sizes, prevent open security groups in runs." },
        { q: "What is terraform graph?", a: "Generates DOT graph of resource dependencies assisting visualization." },
        { q: "Local-exec provisioner use-case?", a: "Run host command after resource creation for integration tasks (notify system)." },
        { q: "Why minimize provisioners?", a: "They are last-resort; increase complexity and reduce declarative transparency." },
        { q: "How to upgrade provider versions?", a: "Adjust constraints then terraform init -upgrade to fetch new versions." },
        { q: "File function usage?", a: "Reads file content into variable (e.g., injecting policies/templates)." }
    ],
    "AWS": [
        { q: "Difference between EC2 and Lambda?", a: "EC2 virtual server persistent runtime; Lambda serverless function executed on demand with autoscaling built-in." },
        { q: "What is an Auto Scaling Group?", a: "Manages fleet size of EC2 instances based on policies & health checks." },
        { q: "Explain IAM role vs user.", a: "User = long-term identity with credentials; Role = assumable temporary permission set." },
        { q: "VPC components?", a: "Subnets, route tables, IGW, NAT gateway, security groups, NACLs, endpoints." },
        { q: "S3 storage classes difference?", a: "Standard, IA, One Zone IA, Glacier Instant/ Flexible/ Deep Archive for different access & cost profiles." },
        { q: "CloudWatch vs CloudTrail?", a: "CloudWatch metrics & logs; CloudTrail records API calls & account activity." },
        { q: "Purpose of ELB types?", a: "ALB (HTTP layer7), NLB (TCP high perf), CLB (classic deprecated transitional)." },
        { q: "What is Route 53?", a: "DNS + health checks + routing policies (latency, weighted, geolocation)." },
        { q: "Difference between Security Group and NACL?", a: "SG stateful instance-level; NACL stateless subnet-level rules ordered." },
        { q: "How to secure secrets?", a: "Use AWS Secrets Manager or SSM Parameter Store with KMS encryption." },
        { q: "EBS vs Instance Store?", a: "EBS persistent network-attached; Instance Store ephemeral physically attached faster but lost on stop." },
        { q: "RDS Multi-AZ purpose?", a: "Provides automatic failover with synchronous standby in another AZ for availability." },
        { q: "Difference between SNS and SQS?", a: "SNS pub/sub fan-out notifications; SQS queue decouples components with pull consumption." },
        { q: "CloudFormation vs Terraform?", a: "CloudFormation AWS-native, uses stacks, drift detection; Terraform multi-cloud with richer modules ecosystem." },
        { q: "ECS vs EKS?", a: "ECS container orchestration AWS-specific; EKS managed Kubernetes control plane." },
        { q: "Purpose of IAM policies?", a: "JSON documents granting/denying permissions attached to identities or resources." },
        { q: "KMS key rotation?", a: "Automatic for AWS-managed keys yearly; manual schedule for customer-managed keys possible." },
        { q: "S3 versioning benefits?", a: "Protects against accidental deletes/overwrites; enables restore of prior object versions." },
        { q: "Cost optimization strategies?", a: "Right-size instances, use Reserved or Savings Plans, spot, storage lifecycle rules." },
        { q: "Difference between PrivateLink and VPC Peering?", a: "PrivateLink exposes specific services privately; peering connects entire VPC routing." },
        { q: "IAM permission boundary?", a: "Limits maximum allowable permissions regardless of attached policies." },
        { q: "GuardDuty purpose?", a: "Threat detection service analyzing logs for malicious activity and anomalies." },
        { q: "S3 bucket policy vs ACL?", a: "Bucket policy granular JSON control; ACL legacy coarse grained access lists." },
        { q: "Glue vs Athena?", a: "Glue ETL/catalog; Athena serverless SQL queries on S3 using catalog metadata." },
        { q: "CloudFront caching mechanism?", a: "Edge locations serve cached content; behaviors define TTL, path-based rules, compression." },
        { q: "EKS node group types?", a: "Managed node groups simplify lifecycle; self-managed allow custom bootstrap; Fargate serverless pods." },
        { q: "DynamoDB vs RDS use-case?", a: "DynamoDB NoSQL key-value low latency; RDS relational structured queries and transactions." },
        { q: "Difference between Secrets Manager and Parameter Store?", a: "Secrets Manager rotation built-in + higher cost; Parameter Store hierarchical free standard tier." },
        { q: "S3 pre-signed URL purpose?", a: "Temporary secure access for upload/download without exposing credentials." },
        { q: "Elastic IP use caution?", a: "Static public IP for instances; charges when unattached, scarce resource allocate only when needed." }
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
        { q: "Canary metric selection?", a: "Error rate, latency, saturation, business KPIs to judge incremental rollout health." }
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
<<<<<<< HEAD
        <h2>Select a Quiz</h2>
        <div class="quiz-menu-grid">
            <button class="quiz-menu-btn" data-quiz="Quiz Practice">
                <h3>Quiz Practice</h3>
                <p>General DevOps MCQ</p>
                <span class="quiz-count">50 questions</span>
            </button>
            <button class="quiz-menu-btn" data-quiz="Quiz2">
                <h3>Quiz2</h3>
                <p>Logo Identification</p>
                <span class="quiz-count">20 images</span>
            </button>
            <button class="quiz-menu-btn" data-quiz="Quiz3">
                <h3>Quiz3</h3>
                <p>Sequential General</p>
                <span class="quiz-count">30 questions</span>
            </button>
            <button class="quiz-menu-btn" data-quiz="Quiz4">
                <h3>Quiz4</h3>
                <p>Sequential Terraform</p>
                <span class="quiz-count">30 questions</span>
            </button>
            <button class="quiz-menu-btn" data-quiz="Quiz5">
                <h3>Quiz5</h3>
                <p>Sequential AWS Networking</p>
                <span class="quiz-count">30 questions</span>
            </button>
            <button class="quiz-menu-btn" data-quiz="Quiz6">
                <h3>Quiz6</h3>
                <p>Sequential Helm Expert</p>
                <span class="quiz-count">30 questions</span>
            </button>
=======
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
>>>>>>> fb4641a (updated)
        </div>
    `;
    container.appendChild(menu);
    
<<<<<<< HEAD
    document.querySelectorAll('.quiz-menu-btn').forEach(btn => {
=======
    // Topic quizzes button
    const topicQuizBtn = container.querySelector('[data-action="topic-quizzes"]');
    if (topicQuizBtn) {
        topicQuizBtn.addEventListener('click', () => {
            renderTopicQuizMenu();
        });
    }
    
    // Challenge quiz buttons
    document.querySelectorAll('.quiz-menu-btn[data-quiz]').forEach(btn => {
>>>>>>> fb4641a (updated)
        btn.addEventListener('click', () => {
            const quizType = btn.dataset.quiz;
            renderTopic(quizType);
        });
    });
}

<<<<<<< HEAD
function renderTopic(topic) {
    if (topic === 'Quizzes') { renderQuizMenu(); return; }
=======
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
    if (topic === 'Quizzes') { renderQuizMenu(); return; }
    if (topic === 'Progress') { renderProgressDashboard(); return; }
>>>>>>> fb4641a (updated)
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
                    <button class="tool-btn" aria-label="Copy question" data-copy="${escapeAttr(item.q)}">Copy Q</button>
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
                    <button class="tool-btn" aria-label="Copy question" data-copy="${escapeAttr(item.q)}">Copy Q</button>
                    <button class="tool-btn" aria-label="Copy answer" data-copy="${escapeAttr(item.a)}">Copy A</button>
                    <span class="index">#${idx + 1}</span>
                </div>
            `;
        }
        container.appendChild(card);
    });
    wireCopyButtons(container);
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

function wireCopyButtons(scope) {
    scope.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('data-copy');
            navigator.clipboard.writeText(text).then(() => showToast('Copied ✅')).catch(() => showToast('Copy failed', 'error'));
        });
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

// Expose for debugging (optional)
window.devOpsData = devOpsData;
window.renderTopic = renderTopic;
window.topicQuizzes = topicQuizzes;
window.startTopicQuiz = startTopicQuiz;
window.renderTopicQuizMenu = renderTopicQuizMenu;
window.confirmQuizExit = confirmQuizExit;

