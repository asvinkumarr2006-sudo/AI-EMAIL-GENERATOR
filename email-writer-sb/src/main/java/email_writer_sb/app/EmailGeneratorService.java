//package email_writer_sb.app;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.web.reactive.function.client.WebClient;
//import tools.jackson.databind.JsonNode;
//import tools.jackson.databind.ObjectMapper;
//
//import java.util.Map;
//
//@Service
//public class EmailGeneratorService {
//    private final WebClient webClient;
//    @Value("${gemini.api.url}")
//    private String geminiApiUrl;
//
//    @Value("${gemini.api.key}")
//    private String geminiApiKey;
//
//    public EmailGeneratorService(WebClient.Builder webClientBuilder){
//        this.webClient=webClientBuilder.build();
//    }
//    public String generateEmailReply(EmailRequest emailRequest){
//        //Build the prompt
//        String prompt=buildPrompt(emailRequest);
//        //Craft a request
//        Map<String,Object> requestBody =Map.of(
//                "contents",new Object[]{
//                        Map.of("parts",new Object[]{
//                                Map.of("text",prompt)
//                        })
//                }
//        );
//
//        // Do the Request and response
//        String response = webClient.post()
//                .uri(geminiApiUrl)
//                .header("Content-Type", "application/json")
//                .header("x-goog-api-key", geminiApiKey)
//                .bodyValue(requestBody)
//                .retrieve()
//                .bodyToMono(String.class)
//                .block();
////        String response =webClient.post()
////                .uri(geminiApiUrl+geminiApiKey)
////                .header("Content-Type","application/json")
////                .bodyValue(requestBody)
////                .retrieve()
////                .bodyToMono(String.class)
////                .block();
//        //Return response
//         return extractResponseContent(response);
//
//    }
//
//    private String extractResponseContent(String response) {
//        try{
//            ObjectMapper mapper=new ObjectMapper();
//            JsonNode rootNode=mapper.readTree(response);
//            return rootNode.path("candidates")
//                    .get(0)
//                    .path("content")
//                    .path("parts")
//                    .get(0)
//                    .path("text")
//                    .asText();
//        }catch(Exception e){
//            return "Error processing request:"+e.getMessage();
//        }
//    }
//
//    private String buildPrompt(EmailRequest emailRequest) {
//        StringBuilder prompt = new StringBuilder();
//
//        prompt.append("Generate a professional email reply for the following email content:Please don't generate a subject line ");
//        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
//            prompt.append("Use a ").append(emailRequest.getTone()).append("tone.");
//        }
//        prompt.append("\n Original emai:\n").append(emailRequest.getEmailContent());
//        return prompt.toString();
//    }
//}

package email_writer_sb.app;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest) {

        // Build the prompt
        String prompt = buildPrompt(emailRequest);

        // Craft a request
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of(
                                "parts", new Object[]{
                                        Map.of("text", prompt)
                                }
                        )
                }
        );

        // Do the request and get response
        String response;

        try {
            response = webClient.post()
                    .uri(geminiApiUrl)
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", geminiApiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

        } catch (WebClientResponseException e) {

            if (e.getStatusCode().value() == 503) {
                return "Gemini service is temporarily unavailable. Please try again.";
            }

            return "Gemini API error: " + e.getStatusCode().value();
        }//this is the replace of the code below ,so that if a gemini time request error is made it is made it is displayed as 500 error.
//        String response = webClient.post()
//                .uri(geminiApiUrl)
//                .header("Content-Type", "application/json")
//                .header("x-goog-api-key", geminiApiKey)
//                .bodyValue(requestBody)
//                .retrieve()
//                .bodyToMono(String.class)
//                .block();

        // Return generated email
        return extractResponseContent(response);
    }

    private String extractResponseContent(String response) {

        try {
            ObjectMapper mapper = new ObjectMapper();

            JsonNode rootNode = mapper.readTree(response);

            return rootNode
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        } catch (Exception e) {
            return "Error processing request: " + e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {

        StringBuilder prompt = new StringBuilder();

        prompt.append(
                "Generate a professional email reply. "
        );

        prompt.append(
                "Please don't generate a subject line. "
        );

        // User's instruction
        if (emailRequest.getPrompt() != null &&
                !emailRequest.getPrompt().isEmpty()) {

            prompt.append(
                    "\nUser's Instruction:\n"
            );

            prompt.append(
                    emailRequest.getPrompt()
            );
        }

        // Tone
        if (emailRequest.getTone() != null &&
                !emailRequest.getTone().isEmpty()) {

            prompt.append(
                            "\nUse a "
                    )
                    .append(emailRequest.getTone())
                    .append(" tone. ");
        }

        // Original email - optional
        if (emailRequest.getEmailContent() != null &&
                !emailRequest.getEmailContent().isEmpty()) {

            prompt.append(
                    "\nOriginal email:\n"
            );

            prompt.append(
                    emailRequest.getEmailContent()
            );
        }

        return prompt.toString();
    }
//    private String buildPrompt(EmailRequest emailRequest) {
//
//        StringBuilder prompt = new StringBuilder();
//
//        prompt.append(
//                "Generate a professional email reply for the following email content. "
//        );
//
//        prompt.append(
//                "Please don't generate a subject line. "
//        );
//
//        prompt.append(
//                "\n User's Instruction:\n"
//        );
//        prompt.append(
//                emailRequest.getPrompt()
//        );
//
//        if (emailRequest.getTone() != null &&
//                !emailRequest.getTone().isEmpty()) {
//
//            prompt.append("Use a ")
//                    .append(emailRequest.getTone())
//                    .append(" tone. ");
//        }
//
//        prompt.append("\nOriginal email:\n")
//                .append(emailRequest.getEmailContent());
//
//        return prompt.toString();
//    }
}