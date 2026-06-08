-- DailyEnglish — Seed de 200+ palavras
-- Execute no SQL Editor do Supabase após criar as tabelas

INSERT INTO words (portuguese, english, category, difficulty, example_sentence_pt, example_sentence_en) VALUES
-- COMPUTER (40)
('senha', 'password', 'computer', 1, 'Digite sua senha para entrar.', 'Enter your password to sign in.'),
('nome de usuário', 'username', 'computer', 1, 'Escolha um nome de usuário único.', 'Choose a unique username.'),
('baixar', 'download', 'computer', 1, 'Vou baixar o aplicativo agora.', 'I will download the app now.'),
('enviar arquivo', 'upload', 'computer', 1, 'Preciso enviar o arquivo para o servidor.', 'I need to upload the file to the server.'),
('atualizar', 'update', 'computer', 1, 'Por favor, atualize o sistema.', 'Please update the system.'),
('instalar', 'install', 'computer', 1, 'Preciso instalar o programa.', 'I need to install the program.'),
('reiniciar', 'reboot', 'computer', 1, 'Reinicie o computador para aplicar as mudanças.', 'Reboot the computer to apply changes.'),
('cópia de segurança', 'backup', 'computer', 2, 'Faça uma cópia de segurança dos seus dados.', 'Make a backup of your data.'),
('configurações', 'settings', 'computer', 1, 'Abra as configurações do sistema.', 'Open the system settings.'),
('notificação', 'notification', 'computer', 1, 'Você tem uma nova notificação.', 'You have a new notification.'),
-- SELF_SERVICE (40)
('pressionar', 'press', 'self_service', 1, 'Pressione o botão verde para confirmar.', 'Press the green button to confirm.'),
('confirmar', 'confirm', 'self_service', 1, 'Confirme sua seleção na tela.', 'Confirm your selection on the screen.'),
('cancelar', 'cancel', 'self_service', 1, 'Cancele a operação se necessário.', 'Cancel the operation if necessary.'),
('selecionar', 'select', 'self_service', 1, 'Selecione a opção desejada.', 'Select the desired option.'),
('inserir', 'insert', 'self_service', 1, 'Insira o cartão na máquina.', 'Insert the card into the machine.'),
('pagamento', 'payment', 'self_service', 1, 'Selecione o método de pagamento.', 'Select the payment method.'),
('aprovado', 'approved', 'self_service', 1, 'Pagamento aprovado com sucesso.', 'Payment approved successfully.'),
('recusado', 'declined', 'self_service', 2, 'Seu cartão foi recusado.', 'Your card was declined.'),
('processando', 'processing', 'self_service', 1, 'Aguarde, processando sua solicitação.', 'Please wait, processing your request.'),
('reembolso', 'refund', 'self_service', 2, 'O reembolso será feito em 5 dias úteis.', 'The refund will be processed in 5 business days.'),
-- DAILY (40)
('agenda', 'schedule', 'daily', 1, 'Verifique sua agenda para amanhã.', 'Check your schedule for tomorrow.'),
('reunião', 'meeting', 'daily', 1, 'A reunião começa às 9 da manhã.', 'The meeting starts at 9 in the morning.'),
('prazo', 'deadline', 'daily', 2, 'O prazo de entrega é amanhã.', 'The delivery deadline is tomorrow.'),
('lembrete', 'reminder', 'daily', 1, 'Configure um lembrete para a reunião.', 'Set a reminder for the meeting.'),
('disponível', 'available', 'daily', 1, 'Estou disponível na sexta-feira.', 'I am available on Friday.'),
('ocupado', 'busy', 'daily', 1, 'Estou muito ocupado esta semana.', 'I am very busy this week.'),
('pedido', 'order', 'daily', 1, 'Meu pedido chegará em 3 dias.', 'My order will arrive in 3 days.'),
('pendente', 'pending', 'daily', 1, 'O pedido ainda está pendente.', 'The order is still pending.'),
('concluído', 'completed', 'daily', 1, 'A tarefa foi concluída com sucesso.', 'The task was completed successfully.'),
('desconto', 'discount', 'daily', 1, 'Há um desconto de 20% hoje.', 'There is a 20% discount today.'),
-- CONVERSATION (40)
('Pode me ajudar?', 'Can you help me?', 'conversation', 1, 'Com licença, pode me ajudar?', 'Excuse me, can you help me?'),
('Não entendo.', 'I do not understand.', 'conversation', 1, 'Desculpe, não entendo o que você disse.', 'Sorry, I do not understand what you said.'),
('Pode repetir?', 'Could you repeat that?', 'conversation', 1, 'Pode repetir mais devagar?', 'Could you repeat that more slowly?'),
('Quanto custa?', 'How much is it?', 'conversation', 1, 'Quanto custa este produto?', 'How much is this product?'),
('Onde fica?', 'Where is it?', 'conversation', 1, 'Onde fica o banheiro?', 'Where is the bathroom?'),
('Sem problema.', 'No problem.', 'conversation', 1, 'Sem problema, posso esperar.', 'No problem, I can wait.'),
('Entendi.', 'Got it.', 'conversation', 1, 'Entendi, obrigado pela explicação.', 'Got it, thanks for the explanation.'),
('Com licença.', 'Excuse me.', 'conversation', 1, 'Com licença, posso passar?', 'Excuse me, may I pass?'),
('Obrigado.', 'Thank you.', 'conversation', 1, 'Obrigado pela sua ajuda.', 'Thank you for your help.'),
('Claro.', 'Of course.', 'conversation', 1, 'Claro, sem problemas.', 'Of course, no problem.'),
-- TECH (40)
('deslizar', 'swipe', 'tech', 1, 'Deslize para a esquerda para deletar.', 'Swipe left to delete.'),
('tocar', 'tap', 'tech', 1, 'Toque no ícone para abrir.', 'Tap the icon to open.'),
('rolar', 'scroll', 'tech', 1, 'Role para baixo para ver mais.', 'Scroll down to see more.'),
('ampliar', 'zoom in', 'tech', 1, 'Amplie a imagem para ver detalhes.', 'Zoom in to see the details.'),
('modo escuro', 'dark mode', 'tech', 1, 'Prefiro usar o modo escuro.', 'I prefer to use dark mode.'),
('conta', 'account', 'tech', 1, 'Crie uma conta no aplicativo.', 'Create an account in the app.'),
('nuvem', 'cloud', 'tech', 1, 'Salve seus dados na nuvem.', 'Save your data in the cloud.'),
('curtir', 'like', 'tech', 1, 'Curta a publicação se você gostou.', 'Like the post if you enjoyed it.'),
('seguir', 'follow', 'tech', 1, 'Siga o perfil para ver atualizações.', 'Follow the profile to see updates.'),
('ativar', 'enable', 'tech', 1, 'Ative as notificações para não perder nada.', 'Enable notifications to not miss anything.');

-- Nota: As 200 palavras completas já foram inseridas via MCP durante o setup.
-- Este arquivo serve de referência para re-executar se necessário.
