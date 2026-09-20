chức năng AI cần được triển khai:
- phần speaking lưu lại câu trả lời cho người dùng nghe phát lại, lưu trữ đó sẽ được lưu trong cache người dùng, nếu ổn thì sẽ gửi cho hệ thống chấm
- khi gửi cho hệ thống sẽ sử dụng model ollama qwen3:4b-instruct , slplab/wav2vec2-large-robust-L2-english-phoneme-recognition và Qwen3-ASR-0.6B dùng huggingface 

- luồng hỏi đáp, hỗ trợ cải thiện writing hay phần chấm cải thiện text đều qua model ollama qwen3:4b-instruc
- luồng hoạt đồng speaking là tách ra 2 phần phân tích đánh giá âm và phân tích ngôn ngữ logic, với phần phân tích âm, đầu vào âm học của audio người dùng sẽ được trực tiếp truyền thẳng vào model slplab/wav2vec2-large-robust-L2-english-phoneme-recognition để chấm phần nào trong đoạn nói bị error, song song đó sử dụng model Qwen3-ASR-0.6B để chuyển sang text và dùng qwen3:4b-instruct để đánh giá chấm điểm và để xuất cải thiện hội thoại dựa vào text và phần lỗi phát âm

- mỗi task AI llm sẽ sử dụng một system prompt khác
- và những phần cần text2 speak thì sử dụng api của https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API của mozilla để làm phần text2speak hãy xây nó làm model cho BE để FE cần thì gọi là xong

- cuối cùng hãy check lại những tính năng bạn làm sẽ nó có chạy hay không, hãy như một user mà thử nghiệm các model api của AI test nhằm đảm bảo mọi thứ hoạt động tốt, nếu có lỗi thì hãy sửa lỗi và làm lại từ đầu để đảm bảo mọi thứ hoạt động hoàn hảo
- xây riêng cho tôi một fe html trong BE đơn giản để test các model api của AI test
