// Todo o texto do site, em português e inglês.
// Para editar o conteúdo, altere só este arquivo.

export type Lang = 'pt' | 'en';

export const profile = {
  name: 'Thiago Alexandre',
  fullName: 'Thiago Pereira dos Santos Alexandre',
  email: 'talexandre.contato@gmail.com',
  linkedin: 'https://www.linkedin.com/in/alexandre-thiago',
  github: 'https://github.com/ThiagoAlexandre33',
  resume: '/curriculo-thiago-alexandre.pdf',
  site: 'https://thiago-alexandre.cloud',
};

const pt = {
  meta: {
    title: 'Thiago Alexandre · Cloud Computing',
    description:
      'Portfólio de Thiago Alexandre, profissional em transição para Cloud Computing. Laboratórios práticos em AWS, redes e Linux.',
  },
  nav: {
    skip: 'Pular para o conteúdo',
    items: [
      { id: 'trajetoria', label: 'Trajetória' },
      { id: 'conhecimentos', label: 'Conhecimentos' },
      { id: 'laboratorios', label: 'Laboratórios' },
      { id: 'formacao', label: 'Formação' },
      { id: 'contato', label: 'Contato' },
    ],
    sound: { on: 'Som ligado', off: 'Som desligado' },
    langLabel: 'Idioma',
  },
  hero: {
    status: 'Disponível · primeira oportunidade em Cloud',
    titleTop: 'Construindo',
    titleBottom: 'na nuvem.',
    role: 'Thiago Alexandre — Analista de Cloud Júnior em formação',
    lead:
      'Estudo AWS, redes e Linux montando ambientes de verdade: VPCs, instâncias, permissões e alarmes. Da operação, trago o hábito de treinar pessoas, documentar e acompanhar indicadores.',
    ctaPrimary: 'Ver laboratórios',
    ctaSecondary: 'Baixar currículo (PDF)',
    location: 'São Paulo, Brasil',
    scroll: 'Role para montar a infraestrutura',
  },
  chapters: {
    eyebrow: 'Trajetória',
    items: [
      {
        tag: 'region: sa-east-1',
        title: 'Primeiro, uma base sólida.',
        text:
          'Bacharel em Administração pela UNIP. Passei por operações e projetos organizando dados, treinando equipes e acompanhando indicadores — a mesma disciplina que um ambiente em nuvem exige.',
      },
      {
        tag: 'vpc: 10.0.0.0/16',
        title: 'Depois, a rede.',
        text:
          'Endereçamento IP e CIDR, sub-redes públicas e privadas, tabelas de rotas e Security Groups. Entender por onde o tráfego passa antes de subir qualquer serviço.',
      },
      {
        tag: 'ec2: running',
        title: 'Então, a prática.',
        text:
          'No AWS re/Start configuro instâncias EC2 Linux, acesso por SSH, sirvo aplicações com Apache e verifico tudo com systemctl, ping e curl.',
      },
      {
        tag: 'cloudwatch: OK',
        title: 'E sempre, observar.',
        text:
          'Métricas, alarmes e controle de acesso com IAM e KMS. Cada laboratório termina documentado: o que montei, o que testei e o que aprendi.',
      },
    ],
  },
  skills: {
    eyebrow: 'Conhecimentos',
    title: 'Ferramentas que já uso em laboratório.',
    groups: [
      {
        name: 'AWS',
        note: 'Computação, armazenamento, rede, identidade e monitoramento.',
        items: ['EC2', 'S3', 'VPC', 'IAM', 'KMS', 'CloudWatch', 'Well-Architected'],
      },
      {
        name: 'Redes & Linux',
        note: 'Da camada de rede ao terminal.',
        items: ['IP & CIDR', 'Sub-redes', 'Tabelas de rotas', 'Security Groups', 'SSH', 'systemctl', 'Bash'],
      },
      {
        name: 'Dados & ferramentas',
        note: 'Herança da operação, útil na nuvem.',
        items: ['Git & GitHub', 'Python', 'SQL', 'Power BI', 'Excel', 'Power Query'],
      },
    ],
  },
  labs: {
    eyebrow: 'Laboratórios',
    title: 'Ambientes que montei, testei e documentei.',
    intro:
      'Laboratórios do AWS re/Start. Cada um segue o mesmo roteiro: objetivo, arquitetura, implementação e resultado.',
    steps: ['Objetivo', 'Arquitetura', 'Implementação', 'Resultado'],
    placeholder: 'Captura de tela em breve',
    repo: 'Ver no GitHub',
    items: [
      {
        code: 'LAB_01',
        title: 'Rede própria na AWS',
        goal: 'Criar uma VPC isolada com sub-redes pública e privada.',
        arch: 'VPC 10.0.0.0/16 · sub-rede pública 10.0.1.0/24 · privada 10.0.2.0/24 · Internet Gateway · tabelas de rotas.',
        impl: 'Associação das tabelas de rotas, rota 0.0.0.0/0 para o Internet Gateway na sub-rede pública.',
        result: 'Conectividade validada com ping e curl; a sub-rede privada permanece sem acesso direto à internet.',
        stack: ['VPC', 'Subnets', 'Route Tables', 'IGW'],
        image: '/labs/lab-01.svg',
      },
      {
        code: 'LAB_02',
        title: 'Servidor web em EC2',
        goal: 'Publicar uma página em uma instância Linux.',
        arch: 'EC2 Amazon Linux em sub-rede pública · Security Group liberando SSH (22) e HTTP (80).',
        impl: 'Acesso via SSH com ajuste de permissão da chave (chmod 400), instalação do Apache e serviço ativado com systemctl.',
        result: 'Página respondendo pelo IP público; serviço configurado para iniciar junto com a instância.',
        stack: ['EC2', 'SSH', 'Apache', 'systemctl'],
        image: '/labs/lab-02.svg',
      },
      {
        code: 'LAB_03',
        title: 'Segurança e monitoramento',
        goal: 'Controlar acessos e reagir a uso anormal de CPU.',
        arch: 'Usuários e políticas IAM · chave KMS para criptografia · alarme CloudWatch sobre CPUUtilization.',
        impl: 'Políticas de menor privilégio, criptografia de dados com KMS e carga de CPU gerada para testar o alarme.',
        result: 'Alarme mudando de OK para ALARM sob carga e voltando ao normal ao fim do teste.',
        stack: ['IAM', 'KMS', 'CloudWatch', 'Alarms'],
        image: '/labs/lab-03.svg',
      },
    ],
  },
  status: {
    eyebrow: 'Painel de status',
    title: 'Progresso em tempo de estudo.',
    sampleNote: 'Valores de exemplo',
    labels: {
      labs: 'Laboratórios concluídos',
      hours: 'Horas de prática',
      cert: 'AWS Cloud Practitioner',
      restart: 'AWS re/Start',
      weekly: 'Horas de estudo por semana',
      uptime: 'Dias seguidos estudando',
    },
    ok: 'OK',
    inProgress: 'Em preparação',
  },
  education: {
    eyebrow: 'Formação',
    title: 'Aprendizado com direção.',
    items: [
      { org: 'Escola da Nuvem', name: 'AWS re/Start — Computação em Nuvem', when: 'desde ago/2026', state: 'Em andamento', kind: 'progress' },
      { org: 'Amazon Web Services', name: 'AWS Certified Cloud Practitioner', when: 'meta de certificação', state: 'Em preparação', kind: 'planned' },
      { org: 'CDFC-IBm · FMRP-USP', name: 'AWS Academy Cloud Foundations', when: 'bolsa conquistada', state: 'Bolsa', kind: 'progress' },
      { org: 'SENAC', name: 'Técnico em Inteligência Artificial', when: 'previsão ago/2027', state: 'Em andamento', kind: 'progress' },
      { org: 'SENAI', name: 'Programação em IA Generativa', when: 'mai/2026 · 40 h', state: 'Concluído', kind: 'done' },
      { org: 'SENAI', name: 'Fundamentos do Python', when: 'mar/2026', state: 'Concluído', kind: 'done' },
      { org: 'UNIP', name: 'Bacharelado em Administração de Empresas', when: 'nov/2024', state: 'Concluído', kind: 'done' },
    ],
  },
  experience: {
    eyebrow: 'Experiência',
    title: 'A operação que me trouxe até aqui.',
    items: [
      {
        org: 'Deep Inteligência',
        role: 'Analista de Projetos Júnior',
        when: 'abr/2026 — atual',
        points: [
          'Suporte à execução de projetos e às equipes de campo.',
          'Criação e acompanhamento de dashboards.',
          'Treinamentos e comunicação com equipes.',
        ],
      },
      {
        org: 'Vulp Air',
        role: 'Analista de Operações Júnior',
        when: 'jul/2025 — abr/2026',
        points: [
          'Planejamento de rotas e acompanhamento operacional.',
          'Monitoramento de lançamentos em sistemas corporativos.',
          'Treinamento e suporte funcional a técnicos e usuários.',
        ],
      },
      {
        org: 'Palimanan Revestimentos',
        role: 'Analista de Operações Júnior',
        when: 'ago/2023 — nov/2024',
        points: ['Organização de dados do SAC, relatórios e acompanhamento de indicadores.'],
      },
    ],
  },
  contact: {
    eyebrow: 'Contato',
    title: 'Vamos conversar sobre o próximo passo?',
    text:
      'Busco minha primeira oportunidade como Analista de Cloud Júnior. Se você procura alguém que monta, testa e documenta, me chame.',
    resume: 'Baixar currículo (PDF)',
  },
  footer: {
    top: 'Voltar ao topo',
    built: 'Construído com Astro, Three.js e GSAP.',
  },
  scene: {
    alt: 'Ilustração de uma infraestrutura em nuvem: região, VPC, sub-redes, servidores e a nuvem acima.',
  },
};

type Content = typeof pt;

const en: Content = {
  meta: {
    title: 'Thiago Alexandre · Cloud Computing',
    description:
      'Portfolio of Thiago Alexandre, transitioning into Cloud Computing. Hands-on labs with AWS, networking and Linux.',
  },
  nav: {
    skip: 'Skip to content',
    items: [
      { id: 'trajetoria', label: 'Journey' },
      { id: 'conhecimentos', label: 'Skills' },
      { id: 'laboratorios', label: 'Labs' },
      { id: 'formacao', label: 'Education' },
      { id: 'contato', label: 'Contact' },
    ],
    sound: { on: 'Sound on', off: 'Sound off' },
    langLabel: 'Language',
  },
  hero: {
    status: 'Available · first role in Cloud',
    titleTop: 'Building',
    titleBottom: 'in the cloud.',
    role: 'Thiago Alexandre — aspiring Junior Cloud Analyst',
    lead:
      'I learn AWS, networking and Linux by building real environments: VPCs, instances, permissions and alarms. From operations I bring the habit of training people, documenting and tracking metrics.',
    ctaPrimary: 'See the labs',
    ctaSecondary: 'Download résumé (PDF, PT)',
    location: 'São Paulo, Brazil',
    scroll: 'Scroll to assemble the infrastructure',
  },
  chapters: {
    eyebrow: 'Journey',
    items: [
      {
        tag: 'region: sa-east-1',
        title: 'First, a solid foundation.',
        text:
          'Bachelor in Business Administration (UNIP). In operations and projects I organized data, trained teams and tracked metrics — the same discipline a cloud environment demands.',
      },
      {
        tag: 'vpc: 10.0.0.0/16',
        title: 'Then, the network.',
        text:
          'IP addressing and CIDR, public and private subnets, route tables and Security Groups. Knowing where traffic flows before launching any service.',
      },
      {
        tag: 'ec2: running',
        title: 'Next, hands-on.',
        text:
          'In AWS re/Start I configure Linux EC2 instances, connect over SSH, serve apps with Apache and verify everything with systemctl, ping and curl.',
      },
      {
        tag: 'cloudwatch: OK',
        title: 'And always, observe.',
        text:
          'Metrics, alarms and access control with IAM and KMS. Every lab ends documented: what I built, what I tested and what I learned.',
      },
    ],
  },
  skills: {
    eyebrow: 'Skills',
    title: 'Tools I already use in labs.',
    groups: [
      {
        name: 'AWS',
        note: 'Compute, storage, networking, identity and monitoring.',
        items: ['EC2', 'S3', 'VPC', 'IAM', 'KMS', 'CloudWatch', 'Well-Architected'],
      },
      {
        name: 'Networking & Linux',
        note: 'From the network layer to the terminal.',
        items: ['IP & CIDR', 'Subnets', 'Route tables', 'Security Groups', 'SSH', 'systemctl', 'Bash'],
      },
      {
        name: 'Data & tools',
        note: 'Carried over from operations, useful in the cloud.',
        items: ['Git & GitHub', 'Python', 'SQL', 'Power BI', 'Excel', 'Power Query'],
      },
    ],
  },
  labs: {
    eyebrow: 'Labs',
    title: 'Environments I built, tested and documented.',
    intro: 'AWS re/Start labs. Each one follows the same path: goal, architecture, implementation and result.',
    steps: ['Goal', 'Architecture', 'Implementation', 'Result'],
    placeholder: 'Screenshot coming soon',
    repo: 'View on GitHub',
    items: [
      {
        code: 'LAB_01',
        title: 'My own network on AWS',
        goal: 'Create an isolated VPC with public and private subnets.',
        arch: 'VPC 10.0.0.0/16 · public subnet 10.0.1.0/24 · private 10.0.2.0/24 · Internet Gateway · route tables.',
        impl: 'Route table associations and a 0.0.0.0/0 route to the Internet Gateway on the public subnet.',
        result: 'Connectivity validated with ping and curl; the private subnet stays without direct internet access.',
        stack: ['VPC', 'Subnets', 'Route Tables', 'IGW'],
        image: '/labs/lab-01.svg',
      },
      {
        code: 'LAB_02',
        title: 'Web server on EC2',
        goal: 'Publish a page from a Linux instance.',
        arch: 'Amazon Linux EC2 in a public subnet · Security Group allowing SSH (22) and HTTP (80).',
        impl: 'SSH access with key permissions fixed (chmod 400), Apache installed and the service enabled with systemctl.',
        result: 'Page served over the public IP; service set to start with the instance.',
        stack: ['EC2', 'SSH', 'Apache', 'systemctl'],
        image: '/labs/lab-02.svg',
      },
      {
        code: 'LAB_03',
        title: 'Security and monitoring',
        goal: 'Control access and react to abnormal CPU usage.',
        arch: 'IAM users and policies · KMS key for encryption · CloudWatch alarm on CPUUtilization.',
        impl: 'Least-privilege policies, data encryption with KMS and generated CPU load to test the alarm.',
        result: 'Alarm moving from OK to ALARM under load and back to normal once the test ended.',
        stack: ['IAM', 'KMS', 'CloudWatch', 'Alarms'],
        image: '/labs/lab-03.svg',
      },
    ],
  },
  status: {
    eyebrow: 'Status dashboard',
    title: 'Progress, measured in study time.',
    sampleNote: 'Sample values',
    labels: {
      labs: 'Labs completed',
      hours: 'Hands-on hours',
      cert: 'AWS Cloud Practitioner',
      restart: 'AWS re/Start',
      weekly: 'Study hours per week',
      uptime: 'Study streak (days)',
    },
    ok: 'OK',
    inProgress: 'Preparing',
  },
  education: {
    eyebrow: 'Education',
    title: 'Learning with direction.',
    items: [
      { org: 'Escola da Nuvem', name: 'AWS re/Start — Cloud Computing', when: 'since Aug 2026', state: 'In progress', kind: 'progress' },
      { org: 'Amazon Web Services', name: 'AWS Certified Cloud Practitioner', when: 'certification goal', state: 'Preparing', kind: 'planned' },
      { org: 'CDFC-IBm · FMRP-USP', name: 'AWS Academy Cloud Foundations', when: 'scholarship awarded', state: 'Scholarship', kind: 'progress' },
      { org: 'SENAC', name: 'Technical degree in Artificial Intelligence', when: 'expected Aug 2027', state: 'In progress', kind: 'progress' },
      { org: 'SENAI', name: 'Generative AI Programming', when: 'May 2026 · 40 h', state: 'Completed', kind: 'done' },
      { org: 'SENAI', name: 'Python Fundamentals', when: 'Mar 2026', state: 'Completed', kind: 'done' },
      { org: 'UNIP', name: 'Bachelor in Business Administration', when: 'Nov 2024', state: 'Completed', kind: 'done' },
    ],
  },
  experience: {
    eyebrow: 'Experience',
    title: 'The operations work that brought me here.',
    items: [
      {
        org: 'Deep Inteligência',
        role: 'Junior Project Analyst',
        when: 'Apr 2026 — present',
        points: [
          'Supporting project execution and field teams.',
          'Building and tracking dashboards.',
          'Training and communicating with teams.',
        ],
      },
      {
        org: 'Vulp Air',
        role: 'Junior Operations Analyst',
        when: 'Jul 2025 — Apr 2026',
        points: [
          'Route planning and operational follow-up.',
          'Monitoring entries in corporate systems.',
          'Training and functional support for technicians and users.',
        ],
      },
      {
        org: 'Palimanan Revestimentos',
        role: 'Junior Operations Analyst',
        when: 'Aug 2023 — Nov 2024',
        points: ['Organizing customer-service data, reports and KPI tracking.'],
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Shall we talk about the next step?',
    text:
      "I'm looking for my first role as a Junior Cloud Analyst. If you need someone who builds, tests and documents, reach out.",
    resume: 'Download résumé (PDF, PT)',
  },
  footer: {
    top: 'Back to top',
    built: 'Built with Astro, Three.js and GSAP.',
  },
  scene: {
    alt: 'Illustration of a cloud infrastructure: region, VPC, subnets, servers and the cloud above.',
  },
};

export const content: Record<Lang, Content> = { pt, en };
